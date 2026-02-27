import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Firefly = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div
    className="absolute w-1.5 h-1.5 rounded-full bg-accent"
    style={{ left: `${x}%`, top: `${y}%` }}
    animate={{
      opacity: [0, 1, 0.4, 0],
      y: [0, -30, -50],
      x: [0, 15, -10],
    }}
    transition={{
      duration: 4 + Math.random() * 3,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const Fireflies = ({ count = 15 }: { count?: number }) => {
  const [fireflies] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      delay: Math.random() * 5,
      x: Math.random() * 100,
      y: 30 + Math.random() * 60,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {fireflies.map((f) => (
        <Firefly key={f.id} delay={f.delay} x={f.x} y={f.y} />
      ))}
    </div>
  );
};

export default Fireflies;
