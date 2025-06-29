import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertRoomSchema, 
  insertGameSchema, 
  insertMessageSchema,
  insertRoomParticipantSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Room routes
  app.get('/api/rooms', async (req, res) => {
    try {
      const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
      const rooms = await storage.getRooms(tags);
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.post('/api/rooms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const roomData = insertRoomSchema.parse({
        ...req.body,
        creatorId: userId,
      });
      
      const room = await storage.createRoom(roomData);
      await storage.joinRoom(room.id, userId);
      
      res.json(room);
    } catch (error) {
      console.error("Error creating room:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid room data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create room" });
      }
    }
  });

  app.get('/api/rooms/:id', async (req, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const room = await storage.getRoom(roomId);
      
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      res.json(room);
    } catch (error) {
      console.error("Error fetching room:", error);
      res.status(500).json({ message: "Failed to fetch room" });
    }
  });

  app.post('/api/rooms/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const roomId = parseInt(req.params.id);
      
      const room = await storage.getRoom(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      if ((room.currentPlayers || 0) >= (room.maxPlayers || 2)) {
        return res.status(400).json({ message: "Room is full" });
      }
      
      await storage.joinRoom(roomId, userId);
      
      // If room is now full, create a game
      const updatedRoom = await storage.getRoom(roomId);
      if (updatedRoom && updatedRoom.currentPlayers === updatedRoom.maxPlayers) {
        const participants = await storage.getRoomParticipants(roomId);
        if (participants.length === 2) {
          await storage.createGame({
            roomId,
            player1Id: participants[0].id,
            player2Id: participants[1].id,
            currentPlayerId: participants[0].id,
            status: "active",
            startedAt: new Date(),
          });
        }
      }
      
      res.json({ message: "Joined room successfully" });
    } catch (error) {
      console.error("Error joining room:", error);
      res.status(500).json({ message: "Failed to join room" });
    }
  });

  app.post('/api/rooms/:id/leave', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const roomId = parseInt(req.params.id);
      
      await storage.leaveRoom(roomId, userId);
      res.json({ message: "Left room successfully" });
    } catch (error) {
      console.error("Error leaving room:", error);
      res.status(500).json({ message: "Failed to leave room" });
    }
  });

  // Game routes
  app.get('/api/rooms/:id/game', async (req, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const game = await storage.getGameByRoom(roomId);
      res.json(game);
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  app.post('/api/games/:id/move', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const gameId = parseInt(req.params.id);
      const { row, col } = req.body;
      
      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      if (game.currentPlayerId !== userId) {
        return res.status(400).json({ message: "Not your turn" });
      }
      
      const board = game.board as string[][];
      if (board[row][col] !== "") {
        return res.status(400).json({ message: "Cell already occupied" });
      }
      
      // Determine player symbol
      const symbol = game.player1Id === userId ? "X" : "O";
      board[row][col] = symbol;
      
      // Check for win or draw
      const winner = checkWinner(board);
      const isDraw = !winner && board.flat().every(cell => cell !== "");
      
      // Update game
      const nextPlayerId = game.player1Id === userId ? (game.player2Id || "") : game.player1Id;
      await storage.updateGameBoard(gameId, board, nextPlayerId || "");
      
      if (winner || isDraw) {
        const winnerId = winner ? userId : undefined;
        const status = winner ? "finished" : "draw";
        await storage.finishGame(gameId, winnerId, status);
        
        // Update user stats
        if (winner) {
          await storage.updateUserStats(userId, true);
          if (game.player2Id) {
            await storage.updateUserStats(game.player2Id, false);
          }
        }
      }
      
      res.json({ 
        board, 
        winner: winner ? symbol : null, 
        isDraw, 
        nextPlayerId: winner || isDraw ? null : nextPlayerId 
      });
    } catch (error) {
      console.error("Error making move:", error);
      res.status(500).json({ message: "Failed to make move" });
    }
  });

  // Message routes
  app.get('/api/rooms/:id/messages', async (req, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const messages = await storage.getRoomMessages(roomId);
      res.json(messages.reverse()); // Reverse to get chronological order
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/rooms/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const roomId = parseInt(req.params.id);
      
      const messageData = insertMessageSchema.parse({
        ...req.body,
        roomId,
        userId,
      });
      
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create message" });
      }
    }
  });

  // User routes
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get('/api/user/games', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const games = await storage.getUserGames(userId);
      res.json(games);
    } catch (error) {
      console.error("Error fetching user games:", error);
      res.status(500).json({ message: "Failed to fetch user games" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to check for a winner
function checkWinner(board: string[][]): boolean {
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
      return true;
    }
  }
  
  // Check columns
  for (let j = 0; j < 3; j++) {
    if (board[0][j] && board[0][j] === board[1][j] && board[1][j] === board[2][j]) {
      return true;
    }
  }
  
  // Check diagonals
  if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
    return true;
  }
  if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
    return true;
  }
  
  return false;
}
