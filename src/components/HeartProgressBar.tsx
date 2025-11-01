import { Heart } from "lucide-react";
import { motion } from "framer-motion";

interface HeartProgressBarProps {
  progress: number;
}

const HeartProgressBar = ({ progress }: HeartProgressBarProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-muted-foreground">Connection</span>
        <span className="text-sm font-bold gradient-text">{progress}%</span>
      </div>
      
      <div className="relative h-6 bg-input rounded-full overflow-hidden border border-accent/30">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-accent to-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <Heart 
            className="w-4 h-4 text-foreground animate-heart-beat" 
            fill={progress > 50 ? "currentColor" : "none"}
          />
        </div>
      </div>
    </div>
  );
};

export default HeartProgressBar;
