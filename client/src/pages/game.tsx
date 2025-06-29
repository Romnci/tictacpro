import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import GameBoard from "@/components/GameBoard";
import Chat from "@/components/Chat";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { Link } from "wouter";
import type { Game, Room, User as UserType } from "@shared/schema";

export default function Game() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, toast]);

  const { data: room } = useQuery({
    queryKey: [`/api/rooms/${roomId}`],
    enabled: !!roomId && !!user,
    refetchInterval: 2000, // Poll every 2 seconds
  });

  const { data: game, refetch: refetchGame } = useQuery({
    queryKey: [`/api/rooms/${roomId}/game`],
    enabled: !!roomId && !!user,
    refetchInterval: 1000, // Poll every second for game state
  });

  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: [`/api/rooms/${roomId}/messages`],
    enabled: !!roomId && !!user,
    refetchInterval: 1000, // Poll every second for new messages
  });

  const makeMoveMutation = useMutation({
    mutationFn: async ({ row, col }: { row: number; col: number }) => {
      const response = await apiRequest("POST", `/api/games/${game.id}/move`, { row, col });
      return await response.json();
    },
    onSuccess: () => {
      refetchGame();
      queryClient.invalidateQueries({ queryKey: [`/api/rooms/${roomId}/game`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to make move. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/rooms/${roomId}/messages`, { content });
    },
    onSuccess: () => {
      refetchMessages();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    },
  });

  const leaveGameMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/rooms/${roomId}/leave`);
    },
    onSuccess: () => {
      toast({
        title: "Left game",
        description: "You have left the game room.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      console.error("Failed to leave game:", error);
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!room || !game) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading game...</p>
        </div>
      </div>
    );
  }

  const isPlayer1 = game.player1Id === user.id;
  const isPlayer2 = game.player2Id === user.id;
  const isMyTurn = game.currentPlayerId === user.id;
  const playerSymbol = isPlayer1 ? "X" : "O";
  const opponentSymbol = isPlayer1 ? "O" : "X";

  const getGameStatus = () => {
    if (game.status === "waiting") return "Waiting for opponent...";
    if (game.status === "finished") {
      if (game.winnerId === user.id) return "You Won! 🎉";
      if (game.winnerId) return "You Lost 😔";
      return "It's a Draw! 🤝";
    }
    if (game.status === "draw") return "It's a Draw! 🤝";
    if (isMyTurn) return "Your Turn";
    return "Opponent's Turn";
  };

  const handleMove = (row: number, col: number) => {
    if (!isMyTurn || game.status !== "active") return;
    makeMoveMutation.mutate({ row, col });
  };

  const handleSendMessage = (content: string) => {
    sendMessageMutation.mutate(content);
  };

  const handleLeaveGame = () => {
    leaveGameMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="grid lg:grid-cols-4 h-screen">
        {/* Game Area */}
        <div className="lg:col-span-3 flex flex-col">
          {/* Game Header */}
          <div className="bg-surface border-b border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Lobby</span>
              </Link>

              <div className="text-center">
                <div className="text-lg font-bold">{room.name}</div>
                <div className="text-sm text-slate-400">Room ID: #{roomId}</div>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLeaveGame}
                  disabled={leaveGameMutation.isPending}
                >
                  Leave Game
                </Button>
              </div>
            </div>
          </div>

          {/* Players Section */}
          <div className="bg-surface border-b border-slate-700 p-6">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {/* Player 1 */}
              <div className="flex items-center space-x-4">
                <img
                  src={user.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"}
                  alt="Player 1"
                  className="w-12 h-12 rounded-full border-3 border-primary"
                />
                <div>
                  <div className="font-bold text-lg">{user.username || user.firstName || "You"}</div>
                  <div className="text-slate-400 text-sm">
                    You • Playing as {playerSymbol}
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary">{playerSymbol}</div>
              </div>

              {/* Game Status */}
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{getGameStatus()}</div>
                {game.status === "active" && (
                  <div className="text-slate-400">Game in progress</div>
                )}
              </div>

              {/* Player 2 / Opponent */}
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-secondary">{opponentSymbol}</div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {game.player2Id ? "Opponent" : "Waiting..."}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {game.player2Id ? `Playing as ${opponentSymbol}` : "For player to join"}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border-3 border-secondary bg-slate-600 flex items-center justify-center">
                  {game.player2Id ? "👤" : "?"}
                </div>
              </div>
            </div>
          </div>

          {/* Game Board */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-lg w-full">
              <GameBoard
                board={game.board as string[][]}
                onMove={handleMove}
                disabled={!isMyTurn || game.status !== "active"}
                isLoading={makeMoveMutation.isPending}
              />
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <Chat
          messages={messages || []}
          onSendMessage={handleSendMessage}
          currentUserId={user.id}
          isLoading={sendMessageMutation.isPending}
        />
      </div>
    </div>
  );
}
