import {
  users,
  rooms,
  games,
  messages,
  roomParticipants,
  type User,
  type UpsertUser,
  type Room,
  type InsertRoom,
  type Game,
  type InsertGame,
  type Message,
  type InsertMessage,
  type RoomParticipant,
  type InsertRoomParticipant,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStats(userId: string, won: boolean, gameTime?: number): Promise<void>;
  getLeaderboard(limit?: number): Promise<User[]>;

  // Room operations
  createRoom(room: InsertRoom): Promise<Room>;
  getRooms(tags?: string[]): Promise<Room[]>;
  getRoom(id: number): Promise<Room | undefined>;
  joinRoom(roomId: number, userId: string): Promise<void>;
  leaveRoom(roomId: number, userId: string): Promise<void>;
  updateRoomPlayerCount(roomId: number): Promise<void>;

  // Game operations
  createGame(game: InsertGame): Promise<Game>;
  getGame(id: number): Promise<Game | undefined>;
  getGameByRoom(roomId: number): Promise<Game | undefined>;
  updateGameBoard(gameId: number, board: string[][], currentPlayerId: string): Promise<void>;
  finishGame(gameId: number, winnerId?: string, status?: string): Promise<void>;
  getUserGames(userId: string, limit?: number): Promise<Game[]>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getRoomMessages(roomId: number, limit?: number): Promise<Message[]>;

  // Room participant operations
  addRoomParticipant(participant: InsertRoomParticipant): Promise<void>;
  removeRoomParticipant(roomId: number, userId: string): Promise<void>;
  getRoomParticipants(roomId: number): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStats(userId: string, won: boolean, gameTime?: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    const updates: Partial<User> = {
      gamesPlayed: (user.gamesPlayed || 0) + 1,
      updatedAt: new Date(),
    };

    if (won) {
      updates.wins = (user.wins || 0) + 1;
      updates.currentStreak = (user.currentStreak || 0) + 1;
      if (gameTime && (!user.bestTime || gameTime < user.bestTime)) {
        updates.bestTime = gameTime;
      }
    } else {
      updates.losses = (user.losses || 0) + 1;
      updates.currentStreak = 0;
    }

    await db.update(users).set(updates).where(eq(users.id, userId));
  }

  async getLeaderboard(limit = 10): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.wins), desc(users.currentStreak))
      .limit(limit);
  }

  // Room operations
  async createRoom(room: InsertRoom): Promise<Room> {
    const [newRoom] = await db.insert(rooms).values(room).returning();
    return newRoom;
  }

  async getRooms(tags?: string[]): Promise<Room[]> {
    let query = db.select().from(rooms);
    let conditions = [eq(rooms.status, "waiting")];
    
    if (tags && tags.length > 0) {
      // Filter by tags - this is a simplified approach, in production you might want a more sophisticated tag matching
      const tagConditions = tags.map(tag => ilike(rooms.tags, `%${tag}%`));
      conditions.push(or(...tagConditions));
    }

    return await query.where(and(...conditions)).orderBy(desc(rooms.createdAt));
  }

  async getRoom(id: number): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room;
  }

  async joinRoom(roomId: number, userId: string): Promise<void> {
    await this.addRoomParticipant({ roomId, userId });
    await this.updateRoomPlayerCount(roomId);
  }

  async leaveRoom(roomId: number, userId: string): Promise<void> {
    await this.removeRoomParticipant(roomId, userId);
    await this.updateRoomPlayerCount(roomId);
  }

  async updateRoomPlayerCount(roomId: number): Promise<void> {
    const participants = await db
      .select()
      .from(roomParticipants)
      .where(eq(roomParticipants.roomId, roomId));

    await db
      .update(rooms)
      .set({ currentPlayers: participants.length })
      .where(eq(rooms.id, roomId));
  }

  // Game operations
  async createGame(game: InsertGame): Promise<Game> {
    const [newGame] = await db.insert(games).values(game).returning();
    return newGame;
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async getGameByRoom(roomId: number): Promise<Game | undefined> {
    const [game] = await db
      .select()
      .from(games)
      .where(and(eq(games.roomId, roomId), or(eq(games.status, "active"), eq(games.status, "waiting"))))
      .orderBy(desc(games.createdAt));
    return game;
  }

  async updateGameBoard(gameId: number, board: string[][], currentPlayerId: string): Promise<void> {
    await db
      .update(games)
      .set({ 
        board: board as any,
        currentPlayerId,
      })
      .where(eq(games.id, gameId));
  }

  async finishGame(gameId: number, winnerId?: string, status = "finished"): Promise<void> {
    await db
      .update(games)
      .set({
        status,
        winnerId,
        finishedAt: new Date(),
      })
      .where(eq(games.id, gameId));
  }

  async getUserGames(userId: string, limit = 10): Promise<Game[]> {
    return await db
      .select()
      .from(games)
      .where(or(eq(games.player1Id, userId), eq(games.player2Id, userId)))
      .orderBy(desc(games.createdAt))
      .limit(limit);
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getRoomMessages(roomId: number, limit = 50): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.roomId, roomId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }

  // Room participant operations
  async addRoomParticipant(participant: InsertRoomParticipant): Promise<void> {
    await db.insert(roomParticipants).values(participant).onConflictDoNothing();
  }

  async removeRoomParticipant(roomId: number, userId: string): Promise<void> {
    await db
      .delete(roomParticipants)
      .where(and(eq(roomParticipants.roomId, roomId), eq(roomParticipants.userId, userId)));
  }

  async getRoomParticipants(roomId: number): Promise<User[]> {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        username: users.username,
        wins: users.wins,
        losses: users.losses,
        gamesPlayed: users.gamesPlayed,
        currentStreak: users.currentStreak,
        bestTime: users.bestTime,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(roomParticipants)
      .innerJoin(users, eq(roomParticipants.userId, users.id))
      .where(eq(roomParticipants.roomId, roomId));

    return result;
  }
}

export const storage = new DatabaseStorage();
