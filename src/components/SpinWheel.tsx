import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface SpinWheelProps {
  onResult: (result: "truth" | "dare") => void;
  disabled?: boolean;
}

const SpinWheel = ({ onResult, disabled }: SpinWheelProps) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (spinning || disabled) return;

    setSpinning(true);
    
    const result = Math.random() > 0.5 ? "truth" : "dare";
    const baseRotation = 360 * 5;
    const resultRotation = result === "truth" ? 0 : 180;
    const finalRotation = baseRotation + resultRotation + Math.random() * 20 - 10;

    setRotation(rotation + finalRotation);

    setTimeout(() => {
      setSpinning(false);
      onResult(result);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-64 h-64">
        {/* Arrow pointer at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-accent drop-shadow-lg animate-pulse-slow" />
        </div>

        {/* Spinning wheel */}
        <motion.div
          className="w-full h-full rounded-full relative overflow-hidden glow-effect-lg"
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "easeOut" }}
        >
          {/* Truth half */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary to-accent flex items-center justify-center origin-bottom border-b-2 border-accent/50">
            <span className="text-2xl font-bold text-foreground rotate-180">TRUTH</span>
          </div>
          
          {/* Dare half */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-secondary to-primary flex items-center justify-center origin-top border-t-2 border-accent/50">
            <span className="text-2xl font-bold text-foreground">DARE</span>
          </div>

          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-accent glow-effect" />
        </motion.div>
      </div>

      <Button
        onClick={spin}
        disabled={spinning || disabled}
        className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-accent glow-effect disabled:opacity-50"
      >
        {spinning ? "Spinning..." : "Spin the Wheel"}
      </Button>
    </div>
  );
};

export default SpinWheel;
