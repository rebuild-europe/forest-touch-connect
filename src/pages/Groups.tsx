import { motion } from "framer-motion";
import Fireflies from "@/components/Fireflies";
import BottomNav from "@/components/BottomNav";
import { Users } from "lucide-react";

interface Group {
  id: string;
  name: string;
  emoji: string;
  members: number;
  description: string;
}

const mockGroups: Group[] = [
  { id: "1", name: "Mycology Circle", emoji: "🍄", members: 12, description: "Foraging, identification, and the hidden network beneath." },
  { id: "2", name: "Night Watchers", emoji: "🌙", members: 8, description: "Stargazing, aurora hunting, and nocturnal walks." },
  { id: "3", name: "Sound Weavers", emoji: "🎧", members: 15, description: "Field recording, ambient composition, forest acoustics." },
  { id: "4", name: "Wild Kitchen", emoji: "🌿", members: 21, description: "Foraged meals, herbal teas, and campfire cooking." },
  { id: "5", name: "Trail Runners", emoji: "🦌", members: 9, description: "Dawn runs through unmarked paths and hidden routes." },
];

const Groups = () => {
  return (
    <div className="relative min-h-screen gradient-forest overflow-hidden pb-24">
      <Fireflies count={6} />

      <motion.div
        className="pt-12 pb-6 px-6 z-10 relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl text-foreground glow-text">Groves</h1>
        <p className="text-muted-foreground text-sm mt-1">Interest groups you can join</p>
      </motion.div>

      <div className="px-6 space-y-3 relative z-10">
        {mockGroups.map((group, i) => (
          <motion.div
            key={group.id}
            className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-5 hover:border-primary/30 transition-all duration-500 cursor-pointer group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0">
                {group.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors">
                  {group.name}
                </h3>
                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                  {group.description}
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-muted-foreground/60 text-xs">
                  <Users className="w-3.5 h-3.5" />
                  <span>{group.members} wanderers</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Groups;
