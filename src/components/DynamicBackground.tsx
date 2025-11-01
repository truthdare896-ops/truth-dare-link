import { useEffect, useState } from "react";

interface DynamicBackgroundProps {
  heartProgress: number;
}

const DynamicBackground = ({ heartProgress }: DynamicBackgroundProps) => {
  const [bgColor, setBgColor] = useState("from-purple-900 to-purple-700");

  useEffect(() => {
    if (heartProgress < 25) {
      setBgColor("from-purple-950 via-purple-900 to-purple-800");
    } else if (heartProgress < 50) {
      setBgColor("from-purple-900 via-purple-800 to-purple-700");
    } else if (heartProgress < 75) {
      setBgColor("from-purple-800 via-purple-700 to-purple-600");
    } else {
      setBgColor("from-purple-700 via-purple-600 to-pink-500");
    }
  }, [heartProgress]);

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br ${bgColor} transition-all duration-1000 ease-in-out -z-10`}
      style={{
        backgroundAttachment: "fixed",
      }}
    />
  );
};

export default DynamicBackground;
