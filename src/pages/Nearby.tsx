import { motion } from "framer-motion";
import { useState } from "react";
import Fireflies from "@/components/Fireflies";
import BottomNav from "@/components/BottomNav";

interface NearbyUser {
  id: string;
  name: string;
  interest: string;
  distance: number; // meters
  angle: number; // degrees on radar
  glow: string;
}

const mockUsers: NearbyUser[] = [
  { id: "1", name: "???", interest: "Mycology", distance: 8, angle: 45, glow: "bg-primary" },
  { id: "2", name: "???", interest: "Night Sky", distance: 15, angle: 160, glow: "bg-accent" },
  { id: "3", name: "???", interest: "Sound Design", distance: 5, angle: 270, glow: "bg-primary" },
  { id: "4", name: "???", interest: "Foraging", distance: 18, angle: 320, glow: "bg-accent" },
];

const Nearby = () => {
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);

  return (
    <div className="relative min-h-screen gradient-forest flex flex-col items-center overflow-hidden">
      <Fireflies count={8} />

      {/* Header */}
      <motion.div
        className="pt-12 pb-6 text-center z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl text-foreground glow-text">Nearby</h1>
        <p className="text-muted-foreground text-sm mt-1">{mockUsers.length} presences detected</p>
      </motion.div>

      {/* Radar */}
      <div className="relative flex-1 flex items-center justify-center w-full max-w-sm mx-auto">
        {/* Radar rings */}
        {[1, 2, 3].map((ring) => (
          <div
            key={ring}
            className="absolute rounded-full border border-primary/10"
            style={{
              width: `${ring * 33}%`,
              height: `${ring * 33}%`,
            }}
          />
        ))}

        {/* Sweep line */}
        <motion.div
          className="absolute w-[1px] h-[45%] origin-bottom bg-gradient-to-t from-primary/40 to-transparent"
          style={{ bottom: "50%" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* Center dot (you) */}
        <div className="absolute w-3 h-3 rounded-full bg-primary glow-primary z-10" />
        <div className="absolute w-6 h-6 rounded-full bg-primary/20 animate-pulse-glow z-5" />

        {/* Nearby users as blips */}
        {mockUsers.map((user) => {
          const normalizedDist = (user.distance / 20) * 40; // % from center
          const rad = (user.angle * Math.PI) / 180;
          const x = Math.cos(rad) * normalizedDist;
          const y = Math.sin(rad) * normalizedDist;

          return (
            <motion.button
              key={user.id}
              className="absolute flex flex-col items-center gap-1 group"
              style={{
                left: `calc(50% + ${x}%)`,
                top: `calc(50% + ${y}%)`,
                transform: "translate(-50%, -50%)",
              }}
              onClick={() => setSelectedUser(user)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + Math.random() * 0.5 }}
              whileHover={{ scale: 1.3 }}
            >
              <motion.div
                className={`w-4 h-4 rounded-full ${user.glow} opacity-60`}
                animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {user.interest}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Selected user panel */}
      {selectedUser && (
        <motion.div
          className="absolute bottom-24 left-4 right-4 z-20 bg-card/90 backdrop-blur-xl border border-primary/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
        >
          <button
            onClick={() => setSelectedUser(null)}
            className="absolute top-3 right-4 text-muted-foreground text-sm"
          >
            ✕
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center glow-primary">
              <span className="text-xl">🌿</span>
            </div>
            <div>
              <p className="text-foreground font-display text-lg">Unknown Wanderer</p>
              <p className="text-primary text-sm">{selectedUser.interest}</p>
              <p className="text-muted-foreground text-xs mt-1">{selectedUser.distance}m away</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="flex-1 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              Approach
            </button>
            <button className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
              Observe
            </button>
          </div>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
};

export default Nearby;
