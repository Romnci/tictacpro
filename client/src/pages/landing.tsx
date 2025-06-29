import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Hash, Users, MessageCircle, Trophy, Play, Zap, Plus, DoorOpen } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between p-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
            <Hash className="text-white text-lg" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            TicTacPro
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-slate-300 hover:text-white transition-colors">
            Features
          </a>
          <a href="#leaderboard" className="text-slate-300 hover:text-white transition-colors">
            Leaderboard
          </a>
          <Button 
            variant="outline" 
            onClick={handleLogin}
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            Login
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Master{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Tic-Tac-Toe
              </span>{" "}
              Like Never Before
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Join thousands of players in real-time multiplayer battles. Chat, compete, and climb
              the leaderboards in the ultimate tic-tac-toe experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={handleLogin}
                className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:scale-105 transition-all"
              >
                Start Playing Free
              </Button>
              <Button variant="outline" size="lg" className="border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Game Preview */}
          <div className="relative">
            <Card className="bg-surface border-slate-700 shadow-2xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
                      alt="Player 1"
                      className="w-10 h-10 rounded-full border-2 border-primary"
                    />
                    <span className="font-semibold">Alex_Pro</span>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-400">VS</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold">Sarah_X</span>
                    <img
                      src="https://images.unsplash.com/photo-1494790108755-2616b612b3c5?w=40&h=40&fit=crop&crop=face"
                      alt="Player 2"
                      className="w-10 h-10 rounded-full border-2 border-secondary"
                    />
                  </div>
                </div>

                {/* Game Board Preview */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center text-3xl font-bold text-primary">
                    X
                  </div>
                  <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center text-3xl font-bold text-secondary">
                    O
                  </div>
                  <div className="aspect-square bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer"></div>
                  <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center text-3xl font-bold text-secondary">
                    O
                  </div>
                  <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center text-3xl font-bold text-primary">
                    X
                  </div>
                  <div className="aspect-square bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer"></div>
                  <div className="aspect-square bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer"></div>
                  <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center text-3xl font-bold text-primary">
                    X
                  </div>
                  <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center text-3xl font-bold text-secondary">
                    O
                  </div>
                </div>

                <div className="text-center text-accent font-semibold">Your Turn - Make Your Move!</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Why Choose TicTacPro?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-surface border-slate-700 hover:border-slate-600 transition-colors">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6">
                <Users className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Real-Time Multiplayer</h3>
              <p className="text-slate-300">
                Challenge players worldwide with instant matchmaking and lag-free gameplay.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-surface border-slate-700 hover:border-slate-600 transition-colors">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-6">
                <MessageCircle className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Live Chat</h3>
              <p className="text-slate-300">
                Communicate with opponents during matches with our integrated chat system.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-surface border-slate-700 hover:border-slate-600 transition-colors">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-6">
                <Trophy className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Leaderboards</h3>
              <p className="text-slate-300">
                Climb the ranks and showcase your skills on global and weekly leaderboards.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
