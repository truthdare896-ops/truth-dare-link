import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Copy, Users } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Room {
  id: string;
  room_code: string;
  game_mode: string;
  player1_name: string;
  player2_name: string | null;
  players: string[] | null;
  max_players: number | null;
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
      setRoom(data as Room);
    } catch (error) {
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

    const players = room.players || [room.player1_name];
    const maxPlayers = room.max_players || 2;

    if (players.length < 2) {
      toast.error("Need at least 2 players to start");
      return;
    }

    if (players.length < maxPlayers) {
      toast.error(`Waiting for ${maxPlayers - players.length} more player(s) to join`);
      return;
    }

    try {
      const { error } = await supabase
        .from("rooms")
        .update({ status: "playing", started_at: new Date().toISOString() })
        .eq("id", room.id);

      if (error) throw error;
    } catch (error) {
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

  const players = (room.players as string[]) || [room.player1_name, room.player2_name].filter(Boolean) as string[];
  const maxPlayers = room.max_players || 2;
  const slotsRemaining = maxPlayers - players.length;
  const canStart = players.length >= 2 && players.length === maxPlayers;

  const gameModeLabel = {
    friendly: "Friendly",
    crush: "Crush",
    adult: "Adult",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="glass-card p-8 rounded-3xl max-w-md w-full glow-effect-lg border-2 border-accent/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(157,78,221,0.2)",
        }}
      >
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.3,
            }}
          >
            <Heart
              className="w-12 h-12 text-accent mx-auto mb-4 animate-float"
              fill="currentColor"
            />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2 gradient-text">Game Lobby</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span className="text-lg">
              {gameModeLabel[room.game_mode as keyof typeof gameModeLabel]} Mode
            </span>
            <span className="text-accent/60">•</span>
            <span className="text-lg flex items-center gap-1">
              <Users className="w-4 h-4" />
              {players.length}/{maxPlayers}
            </span>
          </div>
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div
            className="glass-card p-4 rounded-xl border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-colors"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <p className="text-sm text-muted-foreground mb-2 text-center">Room Code</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-input rounded-lg p-3 text-center">
                <p className="text-3xl font-bold tracking-widest gradient-text">
                  {room.room_code}
                </p>
              </div>
              <motion.button
                onClick={copyRoomCode}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-lg border border-accent/50 hover:bg-accent/10 transition-colors"
              >
                <Copy className="w-5 h-5 text-accent" />
              </motion.button>
            </div>
          </motion.div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="font-semibold">Players</span>
              </div>
              <span className="text-sm text-accent/70">{players.length}/{maxPlayers} joined</span>
            </div>

            <AnimatePresence>
              {players.map((name, index) => (
                <motion.div
                  key={name}
                  className="glass-card p-4 rounded-xl border border-accent/30 bg-accent/5"
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-3 h-3 rounded-full bg-accent flex-shrink-0"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-lg font-semibold">{name}</span>
                    {index === 0 && (
                      <span className="text-xs bg-accent/30 px-2 py-1 rounded-full font-medium ml-auto">
                        Host
                      </span>
                    )}
                    {name === playerName && index !== 0 && (
                      <span className="text-xs bg-primary/30 px-2 py-1 rounded-full font-medium ml-auto">
                        You
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {Array.from({ length: slotsRemaining }).map((_, i) => (
              <motion.div
                key={`empty-${i}`}
                className="glass-card p-4 rounded-xl border border-accent/30 border-dashed"
                animate={{ opacity: [0.4, 0.65, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-muted animate-pulse flex-shrink-0" />
                  <span className="text-lg text-muted-foreground italic">
                    Waiting for player {players.length + i + 1}...
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {isHost && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <Button
                  onClick={startGame}
                  disabled={players.length < 2}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent glow-effect disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {canStart
                    ? "Start Game"
                    : players.length < 2
                    ? "Need at least 2 players"
                    : `Start with ${players.length} players`}
                </Button>
                {!canStart && players.length >= 2 && (
                  <p className="text-center text-xs text-muted-foreground">
                    You can start now or wait for all {maxPlayers} players
                  </p>
                )}
              </motion.div>
            )}

            {!isHost && (
              <motion.div
                className="text-center text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <p className="text-sm">Waiting for host to start the game...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Lobby;
