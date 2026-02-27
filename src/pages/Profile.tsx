import { motion } from "framer-motion";
import Fireflies from "@/components/Fireflies";
import BottomNav from "@/components/BottomNav";
import { Smartphone, TreePine } from "lucide-react";

interface Connection {
  id: string;
  name: string;
  connectedAt: string;
  interest: string;
}

const mockConnections: Connection[] = [
  { id: "1", name: "Moss", connectedAt: "2 days ago", interest: "Mycology" },
  { id: "2", name: "Ember", connectedAt: "1 week ago", interest: "Night Sky" },
];

const Profile = () => {
  return (
    <div className="relative min-h-screen gradient-forest overflow-hidden pb-24">
      <Fireflies count={6} />

      <div className="relative z-10 px-6">
        {/* Profile header */}
        <motion.div
          className="pt-12 pb-8 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center glow-primary mb-4"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <TreePine className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="font-display text-3xl text-foreground glow-text">Wanderer</h1>
          <p className="text-muted-foreground text-sm mt-1">Joined the forest 3 weeks ago</p>
        </motion.div>

        {/* Interests */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-display text-lg text-foreground mb-3">Your Roots</h2>
          <div className="flex flex-wrap gap-2">
            {["Mycology", "Sound Design", "Foraging", "Night Walks"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full bg-secondary border border-border text-secondary-foreground text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Connect CTA */}
        <motion.div
          className="mb-8 bg-card/60 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Smartphone className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-display text-lg text-foreground mb-1">Touch to Connect</h3>
          <p className="text-muted-foreground text-sm">
            Bring your phone close to another Forest dweller to exchange roots.
          </p>
        </motion.div>

        {/* Connections */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="font-display text-lg text-foreground mb-3">Connections</h2>
          <div className="space-y-3">
            {mockConnections.map((conn) => (
              <div
                key={conn.id}
                className="flex items-center gap-4 bg-card/40 border border-border/50 rounded-xl p-4"
              >
                <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <span className="text-sm">🌿</span>
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">{conn.name}</p>
                  <p className="text-muted-foreground text-xs">{conn.interest} • {conn.connectedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
