import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";

interface HeartProgressBarProps {
  progress: number;
}

const HeartProgressBar = ({ progress }: HeartProgressBarProps) => {
  const gradientColor = useMemo(() => {
    if (progress < 25) return "from-purple-600 to-purple-500";
    if (progress < 50) return "from-purple-500 to-purple-400";
    if (progress < 75) return "from-purple-400 to-pink-400";
    return "from-pink-400 to-pink-300";
  }, [progress]);

  const heartColor = useMemo(() => {
    if (progress < 25) return "#9d4edd";
    if (progress < 50) return "#b86bef";
    if (progress < 75) return "#c77dff";
    return "#f0aaff";
  }, [progress]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-muted-foreground">Connection</span>
        <motion.span
          className="text-sm font-bold gradient-text"
          key={Math.floor(progress / 10)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {Math.round(progress)}%
        </motion.span>
      </div>

      <div className="relative h-8 bg-input rounded-full overflow-hidden border-2 border-accent/40">
        <motion.div
          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${gradientColor} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            boxShadow: `0 0 12px ${heartColor}`,
          }}
        />

        <svg
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.3 }}
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="wave"
              x="0"
              y="0"
              width="20"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0,5 Q5,0 10,5 T20,5"
                stroke="white"
                fill="none"
                strokeWidth="0.5"
                opacity="0.4"
              />
            </pattern>
          </defs>
          <rect width="100" height="10" fill="url(#wave)" />
        </svg>

        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          animate={{
            scale: [1, 1.1, 1],
            filter: [
              `drop-shadow(0 0 0px ${heartColor})`,
              `drop-shadow(0 0 8px ${heartColor})`,
              `drop-shadow(0 0 0px ${heartColor})`,
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Heart
            className="w-5 h-5"
            fill={heartColor}
            stroke={heartColor}
            style={{ color: heartColor }}
          />
        </motion.div>
      </div>

      <div className="flex gap-1 mt-3 justify-center">
        {[0, 25, 50, 75, 100].map((milestone) => (
          <motion.div
            key={milestone}
            className="flex-1 h-1 rounded-full bg-accent/20"
            animate={{
              backgroundColor:
                progress >= milestone ? "rgba(157, 78, 221, 0.8)" : "rgba(157, 78, 221, 0.2)",
              boxShadow:
                progress >= milestone
                  ? `0 0 4px rgba(157, 78, 221, 0.6)`
                  : "none",
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeartProgressBar;
