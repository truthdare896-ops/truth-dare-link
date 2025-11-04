import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HeartLinkCompleteProps {
  player1Name: string;
  player2Name: string;
  roomId: string;
}

const HeartLinkComplete = ({ player1Name, player2Name, roomId }: HeartLinkCompleteProps) => {
  const navigate = useNavigate();

  const handlePlayAgain = () => {
    navigate("/");
  };

  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ background: "linear-gradient(135deg, #10002b 0%, #240046 100%)" }}
        animate={{
          background: [
            "linear-gradient(135deg, #10002b 0%, #240046 100%)",
            "linear-gradient(135deg, #c77dff 0%, #e0aaff 100%)",
          ],
        }}
        transition={{ duration: 2, delay: 0.5 }}
      />

      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <motion.div
          className="absolute left-[10%] top-1/2"
          initial={{ x: 0, y: "-50%", scale: 1, opacity: 0 }}
          animate={{ x: 0, y: "-50%", scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <motion.div
            animate={{
              x: ["0vw", "35vw"],
              scale: [1, 0.8],
              opacity: [1, 0],
            }}
            transition={{ duration: 2, delay: 2, ease: "easeInOut" }}
          >
            <Heart
              className="w-24 h-24 md:w-32 md:h-32"
              fill="#c77dff"
              stroke="#c77dff"
              style={{
                filter: "drop-shadow(0 0 20px #c77dff)",
              }}
            />
            <motion.p
              className="text-center mt-2 font-bold text-white"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 2.5 }}
            >
              {player1Name}
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute right-[10%] top-1/2"
          initial={{ x: 0, y: "-50%", scale: 1, opacity: 0 }}
          animate={{ x: 0, y: "-50%", scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <motion.div
            animate={{
              x: ["-0vw", "-35vw"],
              scale: [1, 0.8],
              opacity: [1, 0],
            }}
            transition={{ duration: 2, delay: 2, ease: "easeInOut" }}
          >
            <Heart
              className="w-24 h-24 md:w-32 md:h-32"
              fill="#e0aaff"
              stroke="#e0aaff"
              style={{
                filter: "drop-shadow(0 0 20px #e0aaff)",
              }}
            />
            <motion.p
              className="text-center mt-2 font-bold text-white"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 2.5 }}
            >
              {player2Name}
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 4, type: "spring", stiffness: 200 }}
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Heart
              className="w-48 h-48 md:w-64 md:h-64"
              fill="url(#heartGradient)"
              stroke="#ffffff"
              strokeWidth="2"
              style={{
                filter: "drop-shadow(0 0 40px #c77dff)",
              }}
            />
            <svg width="0" height="0">
              <defs>
                <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c77dff" />
                  <stop offset="100%" stopColor="#e0aaff" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 0.5,
              ease: "easeOut",
            }}
            style={{
              background: "radial-gradient(circle, rgba(199, 125, 255, 0.4) 0%, transparent 70%)",
            }}
          />
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-4"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 5.5 }}
        >
          <motion.div
            className="space-y-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 6 }}
          >
            <motion.div
              className="text-6xl md:text-8xl mb-4"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Heart className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4" fill="#ffffff" stroke="#ffffff" />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ textShadow: "0 0 20px rgba(255,255,255,0.5)" }}>
              Your hearts are now linked!
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              You've completed your Heart Link journey together.
              <br />
              The game ends, but your bond begins.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 6.5 }}
            >
              <Button
                onClick={handlePlayAgain}
                className="px-8 py-6 text-lg font-semibold bg-white text-purple-900 hover:bg-white/90 transition-all"
                size="lg"
              >
                Play Again
              </Button>
              <Button
                onClick={handleBackHome}
                variant="outline"
                className="px-8 py-6 text-lg font-semibold border-2 border-white text-white hover:bg-white/10 transition-all"
                size="lg"
              >
                Back to Home
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HeartLinkComplete;
