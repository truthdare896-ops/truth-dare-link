import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import SpinWheel from "@/components/SpinWheel";
import HeartProgressBar from "@/components/HeartProgressBar";
import { getRandomQuestion } from "@/utils/questions";
import { motion, AnimatePresence } from "framer-motion";
import DynamicBackground from "@/components/DynamicBackground";

interface Room {
  id: string;
  room_code: string;
  game_mode: "friendly" | "crush" | "adult";
  player1_name: string;
  player2_name: string;
  status: string;
}

interface GameTurn {
  id: string;
  turn_number: number;
  player_name: string;
  question_type: "truth" | "dare";
  question: string;
  answer: string | null;
  answered_at: string | null;
}

const GameRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { playerName } = location.state || {};

  const [room, setRoom] = useState<Room | null>(null);
  const [turns, setTurns] = useState<GameTurn[]>([]);
  const [currentTurn, setCurrentTurn] = useState<GameTurn | null>(null);
  const [answer, setAnswer] = useState("");
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId || !playerName) {
      navigate("/");
      return;
    }

    fetchRoom();
    fetchTurns();

    const roomChannel = supabase
      .channel(`game-room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_turns",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          fetchTurns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [roomId, navigate, playerName]);

  useEffect(() => {
    if (room && turns.length > 0) {
      const lastTurn = turns[turns.length - 1];
      
      if (lastTurn.answer) {
        const nextPlayer = lastTurn.player_name === room.player1_name ? room.player2_name : room.player1_name;
        setIsMyTurn(nextPlayer === playerName);
        setCurrentTurn(null);
        setShowWheel(nextPlayer === playerName);
      } else {
        setCurrentTurn(lastTurn);
        setIsMyTurn(lastTurn.player_name === playerName);
        setShowWheel(false);
      }
    } else if (room && turns.length === 0) {
      setIsMyTurn(room.player1_name === playerName);
      setShowWheel(room.player1_name === playerName);
    }
  }, [turns, room, playerName]);

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
      toast.error("Failed to load game");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchTurns = async () => {
    try {
      const { data, error } = await supabase
        .from("game_turns")
        .select()
        .eq("room_id", roomId)
        .order("turn_number", { ascending: true });

      if (error) throw error;
      setTurns((data || []) as GameTurn[]);
    } catch (error) {
      toast.error("Failed to load game turns");
    }
  };

  const handleSpinResult = async (result: "truth" | "dare") => {
    if (!room) return;

    const question = getRandomQuestion(room.game_mode, result);
    const turnNumber = turns.length + 1;

    try {
      const { error } = await supabase.from("game_turns").insert({
        room_id: room.id,
        turn_number: turnNumber,
        player_name: playerName,
        question_type: result,
        question: question,
      });

      if (error) throw error;
      setShowWheel(false);
    } catch (error) {
      toast.error("Failed to create question");
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentTurn || !answer.trim()) {
      toast.error("Please enter an answer");
      return;
    }

    try {
      const { error } = await supabase
        .from("game_turns")
        .update({
          answer: answer.trim(),
          answered_at: new Date().toISOString(),
        })
        .eq("id", currentTurn.id);

      if (error) throw error;
      setAnswer("");
      toast.success("Answer submitted!");
    } catch (error) {
      toast.error("Failed to submit answer");
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

  const heartProgress = Math.min(100, (turns.filter(t => t.answer).length / 20) * 100);

  return (
    <div className="min-h-screen p-4 relative">
      <DynamicBackground heartProgress={heartProgress} />

      <div className="max-w-6xl mx-auto space-y-4 relative z-10">
        <motion.div
          className="glass-card p-4 rounded-2xl glow-effect"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <motion.div
              className={`glass-card px-4 py-2 rounded-lg transition-all ${
                isMyTurn && room.player1_name === playerName
                  ? "border-2 border-accent/60 bg-accent/10"
                  : ""
              }`}
              animate={
                isMyTurn && room.player1_name === playerName
                  ? { scale: [1, 1.05, 1] }
                  : {}
              }
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <p className="font-semibold">{room.player1_name}</p>
            </motion.div>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <Heart className="w-6 h-6 text-accent" fill="currentColor" />
            </motion.div>
            <motion.div
              className={`glass-card px-4 py-2 rounded-lg transition-all ${
                isMyTurn && room.player2_name === playerName
                  ? "border-2 border-accent/60 bg-accent/10"
                  : ""
              }`}
              animate={
                isMyTurn && room.player2_name === playerName
                  ? { scale: [1, 1.05, 1] }
                  : {}
              }
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <p className="font-semibold">{room.player2_name}</p>
            </motion.div>
          </div>
          <HeartProgressBar progress={heartProgress} />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <motion.div
              className="glass-card p-6 rounded-2xl glow-effect min-h-[400px] flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <AnimatePresence mode="wait">
                {showWheel && isMyTurn ? (
                  <motion.div
                    key="wheel"
                    className="flex flex-col items-center w-full"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.h2
                      className="text-2xl font-bold mb-4 gradient-text"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Your Turn!
                    </motion.h2>
                    <SpinWheel onResult={handleSpinResult} />
                  </motion.div>
                ) : currentTurn && !currentTurn.answer ? (
                  <motion.div
                    key="question"
                    className="w-full space-y-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="text-center">
                      <motion.div
                        className="inline-block px-4 py-2 rounded-full bg-accent/20 mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                        }}
                      >
                        <span className="text-lg font-bold gradient-text uppercase">
                          {currentTurn.question_type}
                        </span>
                      </motion.div>
                      <h2 className="text-2xl font-bold mb-2">
                        {currentTurn.player_name}'s Turn
                      </h2>
                    </div>

                    <motion.div
                      className="glass-card p-6 rounded-xl border border-accent/30"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="text-lg text-center">{currentTurn.question}</p>
                    </motion.div>

                    {isMyTurn && (
                      <motion.div
                        className="space-y-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Textarea
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          placeholder="Type your answer here..."
                          className="bg-input border-accent/20 min-h-[100px] resize-none animate-scale-in"
                        />
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={handleSubmitAnswer}
                            className="w-full bg-gradient-to-r from-primary to-accent glow-effect"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit Answer
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}

                    {!isMyTurn && (
                      <motion.div
                        className="text-center text-muted-foreground"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      >
                        <p>Waiting for {currentTurn.player_name} to answer...</p>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="waiting"
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      animate={{ y: [-10, 10, -10] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                    >
                      <Heart
                        className="w-16 h-16 text-accent mx-auto mb-4 animate-float"
                        fill="currentColor"
                      />
                    </motion.div>
                    <p className="text-xl text-muted-foreground">
                      {isMyTurn
                        ? "Get ready for your turn!"
                        : `Waiting for ${
                            room.player1_name === playerName
                              ? room.player2_name
                              : room.player1_name
                          }'s turn...`}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.div
            className="md:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="glass-card p-4 rounded-2xl glow-effect h-[500px] flex flex-col">
              <h3 className="text-lg font-bold mb-3 gradient-text">History</h3>
              <ScrollArea className="flex-1">
                <div className="space-y-3 pr-4">
                  {turns
                    .filter((turn) => turn.answer)
                    .reverse()
                    .map((turn, index) => (
                      <motion.div
                        key={turn.id}
                        className="glass-card p-3 rounded-lg border border-accent/20"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm">
                            {turn.player_name}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 uppercase">
                            {turn.question_type}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {turn.question}
                        </p>
                        <p className="text-sm">{turn.answer}</p>
                      </motion.div>
                    ))}
                  {turns.filter((t) => t.answer).length === 0 && (
                    <motion.p
                      className="text-center text-muted-foreground text-sm py-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      No questions answered yet
                    </motion.p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;
