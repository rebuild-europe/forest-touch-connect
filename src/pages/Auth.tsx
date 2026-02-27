import { useState } from "react";
import { motion } from "framer-motion";
import Fireflies from "@/components/Fireflies";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/nearby");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) setError(error.message);
      else setMessage("Check your email to confirm your account, then sign in.");
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="relative min-h-screen gradient-forest flex flex-col items-center justify-center overflow-hidden px-6">
      <Fireflies count={12} />

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="mx-auto mb-4 w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center glow-primary"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <span className="font-display text-2xl">🌲</span>
          </motion.div>
          <h1 className="font-display text-3xl text-foreground glow-text">The Forest</h1>
          <p className="text-muted-foreground text-sm mt-2">
            {isSignUp ? "Plant your roots" : "Return to the forest"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-card/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-card/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}
          {message && <p className="text-primary text-sm">{message}</p>}

          <motion.button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary font-display text-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
            whileTap={{ scale: 0.97 }}
          >
            {submitting ? "..." : isSignUp ? "Join the Forest" : "Enter"}
          </motion.button>
        </form>

        <p className="text-center text-muted-foreground text-sm mt-6">
          {isSignUp ? "Already rooted?" : "New to the forest?"}{" "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(""); setMessage(""); }}
            className="text-primary hover:underline"
          >
            {isSignUp ? "Sign in" : "Plant your roots"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
