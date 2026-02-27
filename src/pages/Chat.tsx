import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Fireflies from "@/components/Fireflies";
import { ArrowLeft, Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

const Chat = () => {
  const { connectionId } = useParams<{ connectionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [partnerName, setPartnerName] = useState("Wanderer");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!connectionId || !user) return;

    // Load partner name
    const loadPartner = async () => {
      const { data: conn } = await supabase
        .from("connections")
        .select("user_a, user_b")
        .eq("id", connectionId)
        .single();
      if (conn) {
        const partnerId = conn.user_a === user.id ? conn.user_b : conn.user_a;
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", partnerId)
          .single();
        if (profile) setPartnerName(profile.display_name);
      }
    };
    loadPartner();

    // Load messages
    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("connection_id", connectionId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };
    loadMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`messages-${connectionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `connection_id=eq.${connectionId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [connectionId, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !connectionId) return;

    await supabase.from("messages").insert({
      connection_id: connectionId,
      sender_id: user.id,
      content: newMessage.trim(),
    });
    setNewMessage("");
  };

  return (
    <div className="relative min-h-screen gradient-forest flex flex-col overflow-hidden">
      <Fireflies count={4} />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-12 pb-4 border-b border-border/30">
        <button onClick={() => navigate("/profile")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <span className="text-sm">🌿</span>
        </div>
        <h1 className="font-display text-lg text-foreground">{partnerName}</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative z-10">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground/50 text-sm mt-12">
            <p className="font-display text-lg mb-2">A new root has formed</p>
            <p>Send your first whisper through the forest.</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === user?.id;
          return (
            <motion.div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMine
                    ? "bg-primary/15 border border-primary/25 text-foreground rounded-br-md"
                    : "bg-card/60 border border-border/50 text-foreground rounded-bl-md"
                }`}
              >
                {msg.content}
                <div className={`text-[10px] mt-1 ${isMine ? "text-primary/50" : "text-muted-foreground/50"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="relative z-10 px-4 pb-6 pt-3 border-t border-border/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Whisper into the forest..."
            className="flex-1 px-4 py-3 rounded-xl bg-card/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
          />
          <motion.button
            type="submit"
            className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
