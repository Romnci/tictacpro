import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RoomList from "@/components/RoomList";
import CreateRoomModal from "@/components/CreateRoomModal";
import {
  Hash,
  Home,
  User,
  Trophy,
  History,
  Settings,
  Bell,
  LogOut,
  Zap,
  Plus,
  DoorOpen,
  RefreshCw,
} from "lucide-react";
import type { User as UserType, Room } from "@shared/schema";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [tagFilter, setTagFilter] = useState<string>("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
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
  }, [user, isLoading, toast]);

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ["/api/rooms", tagFilter],
    enabled: !!user,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["/api/leaderboard"],
    enabled: !!user,
  });

  const { data: userGames } = useQuery({
    queryKey: ["/api/user/games"],
    enabled: !!user,
  });

  const quickMatchMutation = useMutation({
    mutationFn: async () => {
      // Find an available room or create one
      const availableRooms = rooms?.filter((room: Room) => room.currentPlayers < room.maxPlayers);
      if (availableRooms && availableRooms.length > 0) {
        const room = availableRooms[0];
        await apiRequest("POST", `/api/rooms/${room.id}/join`);
        return room;
      } else {
        // Create a new room
        const response = await apiRequest("POST", "/api/rooms", {
          name: "Quick Match",
          tags: ["casual"],
        });
        return await response.json();
      }
    },
    onSuccess: (room) => {
      toast({
        title: "Match found!",
        description: "Joining game room...",
      });
      setLocation(`/game/${room.id}`);
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
        description: "Failed to find a match. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const refreshRooms = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  const winRate = user.gamesPlayed > 0 ? ((user.wins / user.gamesPlayed) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-slate-700 z-40">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <Hash className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold">TicTacPro</span>
          </div>

          {/* User Profile Section */}
          <Card className="bg-slate-700 border-slate-600 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <img
                  src={user.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border-2 border-primary"
                />
                <div>
                  <div className="font-semibold">{user.username || user.firstName || "Player"}</div>
                  <div className="text-sm text-slate-400">
                    Wins: <span className="text-accent">{user.wins}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span>
                  Wins: <span className="text-accent">{user.wins}</span>
                </span>
                <span>
                  Losses: <span className="text-red-400">{user.losses}</span>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            <Link href="/" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-primary text-white">
              <Home className="h-4 w-4" />
              <span>Game Lobby</span>
            </Link>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
              <History className="h-4 w-4" />
              <span>Game History</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </a>
          </nav>

          {/* Online Status */}
          <div className="mt-8 pt-6 border-t border-slate-600">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-surface border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Game Lobby</h1>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 h-auto flex-col items-start text-left hover:shadow-lg transition-all"
              onClick={() => quickMatchMutation.mutate()}
              disabled={quickMatchMutation.isPending}
            >
              <div className="flex items-center justify-between w-full">
                <div>
                  <h3 className="text-xl font-bold mb-2">Quick Match</h3>
                  <p className="text-slate-200">Find an opponent instantly</p>
                </div>
                <Zap className="h-8 w-8" />
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-slate-600 rounded-xl p-6 h-auto flex-col items-start text-left hover:border-slate-500 transition-all"
              onClick={() => setShowCreateRoom(true)}
            >
              <div className="flex items-center justify-between w-full">
                <div>
                  <h3 className="text-xl font-bold mb-2">Create Room</h3>
                  <p className="text-slate-400">Start a private game</p>
                </div>
                <Plus className="h-8 w-8 text-slate-400" />
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-slate-600 rounded-xl p-6 h-auto flex-col items-start text-left hover:border-slate-500 transition-all"
            >
              <div className="flex items-center justify-between w-full">
                <div>
                  <h3 className="text-xl font-bold mb-2">Join Room</h3>
                  <p className="text-slate-400">Enter a room code</p>
                </div>
                <DoorOpen className="h-8 w-8 text-slate-400" />
              </div>
            </Button>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Rooms List */}
            <div className="lg:col-span-2">
              <Card className="bg-surface border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Available Rooms</CardTitle>
                    <div className="flex items-center space-x-4">
                      <Select value={tagFilter} onValueChange={setTagFilter}>
                        <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
                          <SelectValue placeholder="All Tags" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Tags</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="competitive">Competitive</SelectItem>
                          <SelectItem value="speed">Speed</SelectItem>
                          <SelectItem value="tournament">Tournament</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm" onClick={refreshRooms}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <RoomList rooms={rooms || []} isLoading={roomsLoading} />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="bg-surface border-slate-700">
                <CardHeader>
                  <CardTitle>Your Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Games Played</span>
                    <span className="font-semibold">{user.gamesPlayed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Win Rate</span>
                    <span className="font-semibold text-accent">{winRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Streak</span>
                    <span className="font-semibold text-primary">{user.currentStreak}</span>
                  </div>
                  {user.bestTime && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Best Time</span>
                      <span className="font-semibold">{user.bestTime}s</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-surface border-slate-700">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {userGames && userGames.length > 0 ? (
                    <div className="space-y-3">
                      {userGames.slice(0, 5).map((game: any) => (
                        <div key={game.id} className="flex items-center space-x-3 text-sm">
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              game.winnerId === user.id ? "bg-accent" : "bg-red-400"
                            }`}
                          ></div>
                          <span className="text-slate-300">
                            {game.winnerId === user.id ? "Won" : "Lost"} •{" "}
                            {new Date(game.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No recent games</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <CreateRoomModal open={showCreateRoom} onOpenChange={setShowCreateRoom} />
    </div>
  );
}
