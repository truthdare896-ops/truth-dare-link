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
        transition={{ duration: 1.5, delay: 0.2 }}
      />

      <div className="relative z-10 w-full h-full flex items-center justify-center px-4 sm:px-6 md:px-8">
          <motion.div
          className="flex items-center justify-center"
          initial={{ opacity: 0, y: "10vh" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          <motion.div
            className="flex flex-col items-center justify-center text-center w-full px-4 sm:px-6 md:px-8 max-w-4xl"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <motion.div
              className="mb-6"
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
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto"
                fill="#ffffff"
                stroke="#ffffff"
              />
            </motion.div>

            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 px-2 [text-shadow:_0_0_20px_rgba(255,255,255,0.5)]"
            >
              Your hearts are now linked!
            </h1>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/90 max-w-xs sm:max-w-md md:max-w-2xl mx-auto leading-relaxed px-2 mb-6">
              You've completed your Heart Link journey together.
              <br />
              The game ends, but your bond begins.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
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
