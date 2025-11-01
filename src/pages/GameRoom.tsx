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
      console.error("Error fetching room:", error);
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
      console.error("Error fetching turns:", error);
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
      console.error("Error creating turn:", error);
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
      console.error("Error submitting answer:", error);
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

  const heartProgress = Math.min(100, (turns.filter(t => t.answer).length / 10) * 100);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="glass-card p-4 rounded-2xl glow-effect">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="glass-card px-4 py-2 rounded-lg">
                <p className="font-semibold">{room.player1_name}</p>
              </div>
              <Heart className="w-6 h-6 text-accent" fill="currentColor" />
              <div className="glass-card px-4 py-2 rounded-lg">
                <p className="font-semibold">{room.player2_name}</p>
              </div>
            </div>
          </div>
          <HeartProgressBar progress={heartProgress} />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Main Game Area */}
          <div className="md:col-span-2 space-y-4">
            {/* Spin Wheel or Question */}
            <div className="glass-card p-6 rounded-2xl glow-effect min-h-[400px] flex flex-col items-center justify-center">
              {showWheel && isMyTurn ? (
                <>
                  <h2 className="text-2xl font-bold mb-4 gradient-text">Your Turn!</h2>
                  <SpinWheel onResult={handleSpinResult} />
                </>
              ) : currentTurn && !currentTurn.answer ? (
                <div className="w-full space-y-6">
                  <div className="text-center">
                    <div className="inline-block px-4 py-2 rounded-full bg-accent/20 mb-4">
                      <span className="text-lg font-bold gradient-text uppercase">{currentTurn.question_type}</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{currentTurn.player_name}'s Turn</h2>
                  </div>

                  <div className="glass-card p-6 rounded-xl border border-accent/30">
                    <p className="text-lg text-center">{currentTurn.question}</p>
                  </div>

                  {isMyTurn && (
                    <div className="space-y-3">
                      <Textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="bg-input border-accent/20 min-h-[100px] resize-none"
                      />
                      <Button
                        onClick={handleSubmitAnswer}
                        className="w-full bg-gradient-to-r from-primary to-accent glow-effect"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Submit Answer
                      </Button>
                    </div>
                  )}

                  {!isMyTurn && (
                    <div className="text-center text-muted-foreground">
                      <p>Waiting for {currentTurn.player_name} to answer...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <Heart className="w-16 h-16 text-accent mx-auto mb-4 animate-float" fill="currentColor" />
                  <p className="text-xl text-muted-foreground">
                    {isMyTurn ? "Get ready for your turn!" : `Waiting for ${room.player1_name === playerName ? room.player2_name : room.player1_name}'s turn...`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* History Panel */}
          <div className="md:col-span-1">
            <div className="glass-card p-4 rounded-2xl glow-effect h-[500px] flex flex-col">
              <h3 className="text-lg font-bold mb-3 gradient-text">History</h3>
              <ScrollArea className="flex-1">
                <div className="space-y-3 pr-4">
                  {turns
                    .filter((turn) => turn.answer)
                    .reverse()
                    .map((turn) => (
                      <div key={turn.id} className="glass-card p-3 rounded-lg border border-accent/20">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm">{turn.player_name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 uppercase">
                            {turn.question_type}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{turn.question}</p>
                        <p className="text-sm">{turn.answer}</p>
                      </div>
                    ))}
                  {turns.filter((t) => t.answer).length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8">No questions answered yet</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;
