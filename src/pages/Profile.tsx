import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Fireflies from "@/components/Fireflies";
import BottomNav from "@/components/BottomNav";
import { Smartphone, TreePine, LogOut, Pencil, Check, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  display_name: string;
  interests: string[];
  bio: string | null;
}

interface Connection {
  id: string;
  partner_name: string;
  partner_interests: string[];
  created_at: string;
}

const AVAILABLE_INTERESTS = [
  "Mycology", "Sound Design", "Foraging", "Night Walks", "Stargazing",
  "Photography", "Meditation", "Herbalism", "Bird Watching", "Trail Running",
];

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({ display_name: "Wanderer", interests: [], bio: null });
  const [connections, setConnections] = useState<Connection[]>([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editInterests, setEditInterests] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (p) {
        setProfile({ display_name: p.display_name, interests: p.interests || [], bio: p.bio });
        setEditName(p.display_name);
        setEditInterests(p.interests || []);
      }

      // Load connections
      const { data: conns } = await supabase
        .from("connections")
        .select("*")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

      if (conns && conns.length > 0) {
        const partnerIds = conns.map((c) => (c.user_a === user.id ? c.user_b : c.user_a));
        const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", partnerIds);
        
        const mapped: Connection[] = conns.map((c) => {
          const partnerId = c.user_a === user.id ? c.user_b : c.user_a;
          const pp = profiles?.find((p) => p.user_id === partnerId);
          return {
            id: c.id,
            partner_name: pp?.display_name || "Wanderer",
            partner_interests: pp?.interests || [],
            created_at: c.created_at,
          };
        });
        setConnections(mapped);
      }
    };
    load();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    await supabase.from("profiles").update({
      display_name: editName,
      interests: editInterests,
    }).eq("user_id", user.id);
    setProfile((p) => ({ ...p, display_name: editName, interests: editInterests }));
    setEditing(false);
  };

  const toggleInterest = (interest: string) => {
    setEditInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  return (
    <div className="relative min-h-screen gradient-forest overflow-hidden pb-24">
      <Fireflies count={6} />

      <div className="relative z-10 px-6">
        {/* Header with logout */}
        <div className="pt-12 flex justify-end">
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1">
            <LogOut className="w-4 h-4" /> Leave
          </button>
        </div>

        {/* Profile header */}
        <motion.div
          className="pb-6 flex flex-col items-center"
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

          {editing ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="font-display text-3xl text-foreground bg-transparent border-b border-primary/30 text-center outline-none"
            />
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl text-foreground glow-text">{profile.display_name}</h1>
              <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-primary">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
        </motion.div>

        {/* Interests */}
        <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="font-display text-lg text-foreground mb-3">Your Roots</h2>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTERESTS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleInterest(tag)}
                  className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                    editInterests.includes(tag)
                      ? "bg-primary/20 border-primary/40 text-primary"
                      : "bg-secondary border-border text-secondary-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.interests.length === 0 ? (
                <p className="text-muted-foreground text-sm">Tap the pencil to add your interests</p>
              ) : (
                profile.interests.map((tag) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full bg-secondary border border-border text-secondary-foreground text-sm">
                    {tag}
                  </span>
                ))
              )}
            </div>
          )}
        </motion.div>

        {editing && (
          <motion.button
            onClick={saveProfile}
            className="w-full mb-6 py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary font-display flex items-center justify-center gap-2"
            whileTap={{ scale: 0.97 }}
          >
            <Check className="w-4 h-4" /> Save Changes
          </motion.button>
        )}

        {/* Connect CTA */}
        <motion.div
          className="mb-6 bg-card/60 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 text-center"
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h2 className="font-display text-lg text-foreground mb-3">
            Connections {connections.length > 0 && `(${connections.length})`}
          </h2>
          {connections.length === 0 ? (
            <p className="text-muted-foreground text-sm">No roots yet. Connect by touching phones with another Forest dweller.</p>
          ) : (
            <div className="space-y-3">
              {connections.map((conn) => (
                <motion.div
                  key={conn.id}
                  className="flex items-center gap-4 bg-card/40 border border-border/50 rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => navigate(`/chat/${conn.id}`)}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
                    <span className="text-sm">🌿</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{conn.partner_name}</p>
                    <p className="text-muted-foreground text-xs">
                      {conn.partner_interests.slice(0, 2).join(", ") || "No roots yet"}
                    </p>
                  </div>
                  <MessageCircle className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
