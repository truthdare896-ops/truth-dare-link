import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

interface FloatingHeart {
  id: string;
  left: number;
  delay: number;
  duration: number;
}

const FloatingHearts = () => {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  useEffect(() => {
    const generateHearts = () => {
      const newHearts: FloatingHeart[] = Array.from({ length: 6 }, (_, i) => ({
        id: `${Date.now()}-${i}`,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 8 + Math.random() * 4,
      }));
      setHearts((prev) => [...prev, ...newHearts]);
    };

    generateHearts();
    const interval = setInterval(generateHearts, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHearts((prev) => prev.slice(6));
    }, 12000);

    return () => clearTimeout(timer);
  }, [hearts.length]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute animate-floating-heart"
          style={{
            left: `${heart.left}%`,
            bottom: "-20px",
            opacity: 0.3,
            "--tx": `${(Math.random() - 0.5) * 100}px`,
          } as React.CSSProperties}
        >
          <Heart
            className="w-6 h-6 text-accent"
            fill="currentColor"
            style={{
              animation: `floatingHeart ${heart.duration}s ease-in forwards`,
              animationDelay: `${heart.delay}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default FloatingHearts;
