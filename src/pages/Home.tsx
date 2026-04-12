import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Users } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import FloatingHearts from "@/components/FloatingHearts";

const Home = () => {
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: "",
    gameMode: "friendly" as "friendly" | "crush" | "adult",
    maxPlayers: "2",
  });

  const [joinForm, setJoinForm] = useState({
    name: "",
    roomCode: "",
  });

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateRoom = async () => {
    if (!createForm.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    const maxPlayers = parseInt(createForm.maxPlayers);

    try {
      const roomCode = generateRoomCode();
      const { data, error } = await supabase
        .from("rooms")
        .insert({
          room_code: roomCode,
          game_mode: createForm.gameMode,
          player1_name: createForm.name.trim(),
          players: [createForm.name.trim()],
          max_players: maxPlayers,
          status: "waiting",
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/lobby/${data.id}`, { state: { isHost: true, playerName: createForm.name.trim() } });
    } catch (error) {
      toast.error("Failed to create room. Please try again.");
    }
  };

  const handleJoinRoom = async () => {
    if (!joinForm.name.trim() || !joinForm.roomCode.trim()) {
      toast.error("Please enter your name and room code");
      return;
    }

    try {
      const { data: room, error: fetchError } = await supabase
        .from("rooms")
        .select()
        .eq("room_code", joinForm.roomCode.toUpperCase())
        .eq("status", "waiting")
        .maybeSingle();

      if (fetchError || !room) {
        toast.error("Room not found or already started");
        return;
      }

      const currentPlayers = (room.players as string[]) || [room.player1_name];
      const maxPlayers = room.max_players || 2;

      if (currentPlayers.includes(joinForm.name.trim())) {
        toast.error("A player with this name already exists in this room");
        return;
      }

      if (currentPlayers.length >= maxPlayers) {
        toast.error("Room is full");
        return;
      }

      const updatedPlayers = [...currentPlayers, joinForm.name.trim()];
      const updateData: Record<string, unknown> = {
        players: updatedPlayers,
      };

      if (!room.player2_name) {
        updateData.player2_name = joinForm.name.trim();
      }

      const { error: updateError } = await supabase
        .from("rooms")
        .update(updateData)
        .eq("id", room.id);

      if (updateError) throw updateError;

      navigate(`/lobby/${room.id}`, { state: { isHost: false, playerName: joinForm.name.trim() } });
    } catch (error) {
      toast.error("Failed to join room. Please try again.");
    }
  };

  const isFriendlyMode = createForm.gameMode === "friendly";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <FloatingHearts />

      <motion.div
        className="glass-card p-8 rounded-3xl max-w-md w-full glow-effect-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="flex justify-center mb-4"
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
              className="w-16 h-16 text-accent animate-heart-beat"
              fill="currentColor"
            />
          </motion.div>
          <motion.h1
            className="text-5xl font-bold mb-2 gradient-text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Heart Link
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Connect through truth and dare
          </motion.p>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-accent/50 transition-all duration-300 glow-effect"
                size="lg"
              >
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-accent/20">
              <DialogHeader>
                <DialogTitle className="text-2xl gradient-text">
                  Create New Room
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Your Name</Label>
                  <Input
                    id="create-name"
                    placeholder="Enter your name"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    className="bg-input border-accent/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="game-mode">Game Mode</Label>
                  <Select
                    value={createForm.gameMode}
                    onValueChange={(value) =>
                      setCreateForm({
                        ...createForm,
                        gameMode: value as "friendly" | "crush" | "adult",
                        maxPlayers: value === "friendly" ? createForm.maxPlayers : "2",
                      })
                    }
                  >
                    <SelectTrigger id="game-mode" className="bg-input border-accent/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-accent/20">
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="crush">Crush</SelectItem>
                      <SelectItem value="adult">Adult</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isFriendlyMode && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Label htmlFor="max-players" className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent" />
                      Number of Players
                    </Label>
                    <Select
                      value={createForm.maxPlayers}
                      onValueChange={(value) =>
                        setCreateForm({ ...createForm, maxPlayers: value })
                      }
                    >
                      <SelectTrigger id="max-players" className="bg-input border-accent/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-accent/20">
                        <SelectItem value="2">2 Players</SelectItem>
                        <SelectItem value="3">3 Players</SelectItem>
                        <SelectItem value="4">4 Players</SelectItem>
                        <SelectItem value="5">5 Players</SelectItem>
                      </SelectContent>
                    </Select>
                    {parseInt(createForm.maxPlayers) > 2 && (
                      <p className="text-xs text-muted-foreground">
                        Share the room code with up to {parseInt(createForm.maxPlayers) - 1} more friends
                      </p>
                    )}
                  </motion.div>
                )}

                <Button
                  onClick={handleCreateRoom}
                  className="w-full bg-gradient-to-r from-primary to-accent glow-effect"
                >
                  Create Room
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-14 text-lg font-semibold border-2 border-accent/50 hover:bg-accent/10 transition-all duration-300"
                size="lg"
              >
                Join Room
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-accent/20">
              <DialogHeader>
                <DialogTitle className="text-2xl gradient-text">
                  Join Room
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="join-name">Your Name</Label>
                  <Input
                    id="join-name"
                    placeholder="Enter your name"
                    value={joinForm.name}
                    onChange={(e) =>
                      setJoinForm({ ...joinForm, name: e.target.value })
                    }
                    className="bg-input border-accent/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-code">Room Code</Label>
                  <Input
                    id="room-code"
                    placeholder="Enter 6-character code"
                    value={joinForm.roomCode}
                    onChange={(e) =>
                      setJoinForm({
                        ...joinForm,
                        roomCode: e.target.value.toUpperCase(),
                      })
                    }
                    maxLength={6}
                    className="bg-input border-accent/20 uppercase tracking-widest text-center text-xl font-bold"
                  />
                </div>
                <Button
                  onClick={handleJoinRoom}
                  className="w-full bg-gradient-to-r from-primary to-accent glow-effect"
                >
                  Join Room
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div
          className="mt-8 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <p>2-5 players in Friendly mode • Real-time sync • Pure fun</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
