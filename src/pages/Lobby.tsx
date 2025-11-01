import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Copy, Users } from "lucide-react";
import { toast } from "sonner";

interface Room {
  id: string;
  room_code: string;
  game_mode: string;
  player1_name: string;
  player2_name: string | null;
  status: string;
}

const Lobby = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isHost, playerName } = location.state || {};

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId || !playerName) {
      navigate("/");
      return;
    }

    fetchRoom();
    
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const updatedRoom = payload.new as Room;
            setRoom(updatedRoom);
            
            if (updatedRoom.status === "playing") {
              navigate(`/game/${roomId}`, { state: { playerName } });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, navigate, playerName]);

  const fetchRoom = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select()
        .eq("id", roomId)
        .single();

      if (error) throw error;
      setRoom(data);
    } catch (error) {
      console.error("Error fetching room:", error);
      toast.error("Failed to load room");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const copyRoomCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.room_code);
      toast.success("Room code copied!");
    }
  };

  const startGame = async () => {
    if (!room) return;

    if (!room.player2_name) {
      toast.error("Waiting for player 2 to join");
      return;
    }

    try {
      const { error } = await supabase
        .from("rooms")
        .update({ status: "playing", started_at: new Date().toISOString() })
        .eq("id", room.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error starting game:", error);
      toast.error("Failed to start game");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Heart className="w-12 h-12 text-accent animate-heart-beat" fill="currentColor" />
      </div>
    );
  }

  if (!room) return null;

  const gameModeEmoji = {
    friendly: "🤝",
    crush: "💕",
    adult: "🔥",
  };

  const gameModeName = {
    friendly: "Friendly",
    crush: "Crush",
    adult: "Adult",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 rounded-3xl max-w-md w-full glow-effect-lg">
        <div className="text-center mb-8">
          <Heart className="w-12 h-12 text-accent mx-auto mb-4 animate-float" fill="currentColor" />
          <h1 className="text-3xl font-bold mb-2 gradient-text">Game Lobby</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span className="text-2xl">{gameModeEmoji[room.game_mode as keyof typeof gameModeEmoji]}</span>
            <span className="text-lg">{gameModeName[room.game_mode as keyof typeof gameModeName]} Mode</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-4 rounded-xl border border-accent/30">
            <p className="text-sm text-muted-foreground mb-2 text-center">Room Code</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-input rounded-lg p-3 text-center">
                <p className="text-3xl font-bold tracking-widest gradient-text">{room.room_code}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={copyRoomCode}
                className="border-accent/50 hover:bg-accent/10 h-12 w-12"
              >
                <Copy className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="w-5 h-5" />
              <span className="font-semibold">Players</span>
            </div>
            
            <div className="glass-card p-4 rounded-xl border border-accent/30">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-accent animate-pulse-slow" />
                <span className="text-lg font-semibold">{room.player1_name}</span>
                {isHost && <span className="text-xs bg-accent/20 px-2 py-1 rounded-full">Host</span>}
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl border border-accent/30">
              {room.player2_name ? (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-accent animate-pulse-slow" />
                  <span className="text-lg font-semibold">{room.player2_name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-muted animate-pulse" />
                  <span className="text-lg text-muted-foreground italic">Waiting for player 2...</span>
                </div>
              )}
            </div>
          </div>

          {isHost && (
            <Button
              onClick={startGame}
              disabled={!room.player2_name}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent glow-effect disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Game
            </Button>
          )}

          {!isHost && (
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Waiting for host to start the game...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
