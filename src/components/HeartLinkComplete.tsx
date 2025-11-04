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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
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

      <div className="relative z-10 w-full h-full flex items-center justify-center px-4 sm:px-6 md:px-8">
        <motion.div
          className="absolute left-[5%] sm:left-[8%] md:left-[10%] top-1/2"
          initial={{ x: 0, y: "-50%", scale: 1, opacity: 0 }}
          animate={{ x: 0, y: "-50%", scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          style={{
            maxWidth: "clamp(60px, 15vw, 128px)",
          }}
        >
          <motion.div
            animate={{
              x: ["0vw", "min(35vw, 250px)"],
              scale: [1, 0.8],
              opacity: [1, 0],
            }}
            transition={{ duration: 2, delay: 2, ease: "easeInOut" }}
          >
            <Heart
              className="w-full h-auto aspect-square"
              fill="#c77dff"
              stroke="#c77dff"
              style={{
                filter: "drop-shadow(0 0 min(20px, 1vw) #c77dff)",
              }}
            />
            <motion.p
              className="text-center mt-1 sm:mt-2 font-bold text-white text-xs sm:text-sm md:text-base whitespace-nowrap"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 2.5 }}
            >
              {player1Name}
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute right-[5%] sm:right-[8%] md:right-[10%] top-1/2"
          initial={{ x: 0, y: "-50%", scale: 1, opacity: 0 }}
          animate={{ x: 0, y: "-50%", scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          style={{
            maxWidth: "clamp(60px, 15vw, 128px)",
          }}
        >
          <motion.div
            animate={{
              x: ["-0vw", "-min(35vw, 250px)"],
              scale: [1, 0.8],
              opacity: [1, 0],
            }}
            transition={{ duration: 2, delay: 2, ease: "easeInOut" }}
          >
            <Heart
              className="w-full h-auto aspect-square"
              fill="#e0aaff"
              stroke="#e0aaff"
              style={{
                filter: "drop-shadow(0 0 min(20px, 1vw) #e0aaff)",
              }}
            />
            <motion.p
              className="text-center mt-1 sm:mt-2 font-bold text-white text-xs sm:text-sm md:text-base whitespace-nowrap"
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
          style={{
            width: "clamp(120px, 30vw, 256px)",
            height: "clamp(120px, 30vw, 256px)",
          }}
        >
          <motion.div
            className="w-full h-full flex items-center justify-center"
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
              className="w-full h-full"
              fill="url(#heartGradient)"
              stroke="#ffffff"
              strokeWidth="2"
              style={{
                filter: "drop-shadow(0 0 min(40px, 2vw) #c77dff)",
              }}
            />
            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c77dff" />
                  <stop offset="100%" stopColor="#e0aaff" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
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
          className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center w-full px-4 sm:px-6 md:px-8 max-w-4xl pb-8 sm:pb-12 md:pb-16"
          initial={{ opacity: 0, y: "10vh" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 5.5 }}
        >
          <motion.div
            className="space-y-3 sm:space-y-4 md:space-y-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 6 }}
          >
            <motion.div
              className="mb-2 sm:mb-3 md:mb-4"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Heart
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-2 sm:mb-3 md:mb-4"
                fill="#ffffff"
                stroke="#ffffff"
              />
            </motion.div>

            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 sm:mb-3 md:mb-4 px-2"
              style={{ textShadow: "0 0 20px rgba(255,255,255,0.5)" }}
            >
              Your hearts are now linked!
            </h1>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/90 max-w-xs sm:max-w-md md:max-w-2xl mx-auto leading-relaxed px-2 mb-6 sm:mb-8">
              You've completed your Heart Link journey together.
              <br />
              The game ends, but your bond begins.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-2 sm:mt-4 px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 6.5 }}
            >
              <Button
                onClick={handlePlayAgain}
                className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-semibold bg-white text-purple-900 hover:bg-white/90 transition-all whitespace-nowrap"
                size="lg"
              >
                Play Again
              </Button>
              <Button
                onClick={handleBackHome}
                variant="outline"
                className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-semibold border-2 border-white text-white hover:bg-white/10 transition-all whitespace-nowrap"
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
