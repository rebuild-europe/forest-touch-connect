import { motion } from "framer-motion";
import { Smartphone } from "lucide-react";
import Fireflies from "@/components/Fireflies";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleEnter = () => {
    navigate(user ? "/nearby" : "/auth");
  };

  return (
    <div className="relative min-h-screen gradient-forest flex flex-col items-center justify-center overflow-hidden px-6">
      <Fireflies count={20} />

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <motion.div
        className="relative z-10 text-center max-w-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <motion.div
          className="mx-auto mb-8 w-20 h-20 rounded-full border border-primary/30 flex items-center justify-center glow-primary"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="font-display text-3xl text-primary">🌲</span>
        </motion.div>

        <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-4 glow-text">
          The Forest
        </h1>

        <motion.p
          className="text-muted-foreground text-lg mb-2 font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Some connections can only be made in person.
        </motion.p>

        <motion.p
          className="text-muted-foreground/60 text-sm mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          Touch phones. Share presence. Discover kindred spirits.
        </motion.p>

        <motion.button
          onClick={handleEnter}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50 transition-all duration-500"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <Smartphone className="w-5 h-5" />
          <span className="font-display text-lg">Enter the Forest</span>
          <div className="absolute inset-0 rounded-full glow-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </motion.button>
      </motion.div>

      <motion.div
        className="absolute bottom-8 text-muted-foreground/40 text-xs text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        Proximity • Presence • Connection
      </motion.div>
    </div>
  );
};

export default Landing;
