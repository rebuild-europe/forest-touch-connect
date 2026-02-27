import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import Fireflies from "@/components/Fireflies";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ScanLine, QrCode, X, Check, Loader2 } from "lucide-react";

const Connect = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<"show" | "scan">("show");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanContainerRef = useRef<HTMLDivElement>(null);

  const qrValue = user ? `forest:${user.id}` : "";

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanning = () => {
    setScanResult(null);
    setError("");
    setConnected(false);

    // Request camera FIRST (directly in click handler to preserve gesture)
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        // Stop the stream immediately — Html5Qrcode will open its own
        stream.getTracks().forEach((t) => t.stop());

        // Now switch mode so the DOM element renders
        setMode("scan");

        // Use requestAnimationFrame to wait for DOM paint, then start scanner
        requestAnimationFrame(() => {
          requestAnimationFrame(async () => {
            try {
              const scanner = new Html5Qrcode("qr-reader");
              scannerRef.current = scanner;

              await scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 220, height: 220 } },
                (decoded) => {
                  if (decoded.startsWith("forest:")) {
                    scanner.stop().catch(() => {});
                    const partnerId = decoded.replace("forest:", "");
                    handleConnect(partnerId);
                  }
                },
                () => {}
              );
            } catch (err: any) {
              setError("Could not start scanner. Try again.");
            }
          });
        });
      })
      .catch(() => {
        setError("Camera access denied. Please allow camera permissions in your browser settings.");
      });
  };

  const stopScanning = () => {
    if (scannerRef.current?.isScanning) {
      scannerRef.current.stop().catch(() => {});
    }
    setMode("show");
  };

  const handleConnect = async (partnerId: string) => {
    if (!user || partnerId === user.id) {
      setError("You can't connect with yourself!");
      setMode("show");
      return;
    }

    setConnecting(true);
    setScanResult(partnerId);

    // Check if already connected
    const { data: existing } = await supabase
      .from("connections")
      .select("id")
      .or(
        `and(user_a.eq.${user.id},user_b.eq.${partnerId}),and(user_a.eq.${partnerId},user_b.eq.${user.id})`
      );

    if (existing && existing.length > 0) {
      setError("You're already rooted with this wanderer!");
      setConnecting(false);
      setMode("show");
      return;
    }

    // Get partner name
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", partnerId)
      .single();

    if (!profile) {
      setError("Wanderer not found in the forest.");
      setConnecting(false);
      setMode("show");
      return;
    }

    setPartnerName(profile.display_name);

    // Create connection (user_a is always the smaller UUID for consistency)
    const [a, b] = [user.id, partnerId].sort();
    const { error: insertError } = await supabase.from("connections").insert({
      user_a: a,
      user_b: b,
    });

    if (insertError) {
      setError("Failed to root. Try again.");
      setConnecting(false);
      setMode("show");
      return;
    }

    setConnecting(false);
    setConnected(true);
  };

  return (
    <div className="relative min-h-screen gradient-forest flex flex-col items-center overflow-hidden pb-24">
      <Fireflies count={8} />

      <motion.div
        className="pt-12 pb-4 text-center z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl text-foreground glow-text">Root</h1>
        <p className="text-muted-foreground text-sm mt-1">Exchange roots with nearby wanderers</p>
      </motion.div>

      {/* Mode toggle */}
      <div className="relative z-10 flex gap-2 mb-6">
        <button
          onClick={() => { stopScanning(); setMode("show"); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === "show"
              ? "bg-primary/15 border border-primary/30 text-primary"
              : "bg-card/40 border border-border/50 text-muted-foreground"
          }`}
        >
          <QrCode className="w-4 h-4" /> My Roots
        </button>
        <button
          onClick={startScanning}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === "scan"
              ? "bg-primary/15 border border-primary/30 text-primary"
              : "bg-card/40 border border-border/50 text-muted-foreground"
          }`}
        >
          <ScanLine className="w-4 h-4" /> Scan
        </button>
      </div>

      <div className="relative z-10 flex-1 flex items-start justify-center w-full px-6">
        <AnimatePresence mode="wait">
          {mode === "show" && !connected && (
            <motion.div
              key="qr"
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {/* QR with root overlay */}
              <div className="relative">
                {/* Root tendrils around QR */}
                <svg className="absolute -inset-6 w-[calc(100%+48px)] h-[calc(100%+48px)]" viewBox="0 0 300 300" fill="none">
                  {/* Organic root paths */}
                  <path d="M150 10 C140 40, 120 60, 110 80 C100 100, 95 110, 90 130" stroke="hsl(165 80% 40% / 0.3)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M150 10 C160 35, 175 55, 185 75 C195 95, 200 115, 205 135" stroke="hsl(165 80% 40% / 0.2)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <path d="M10 150 C40 145, 55 140, 75 135 C90 130, 100 128, 115 125" stroke="hsl(165 80% 40% / 0.25)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M290 150 C260 148, 245 145, 225 140 C210 136, 200 133, 185 130" stroke="hsl(165 80% 40% / 0.2)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <path d="M150 290 C145 260, 138 245, 130 225 C125 210, 122 200, 120 185" stroke="hsl(165 80% 40% / 0.3)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M150 290 C155 265, 162 250, 170 230 C175 215, 178 200, 180 185" stroke="hsl(165 80% 40% / 0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  {/* Small root branches */}
                  <path d="M90 130 C80 140, 70 145, 60 155" stroke="hsl(165 80% 40% / 0.15)" strokeWidth="1" fill="none" strokeLinecap="round"/>
                  <path d="M205 135 C215 145, 225 150, 240 155" stroke="hsl(165 80% 40% / 0.12)" strokeWidth="1" fill="none" strokeLinecap="round"/>
                  <path d="M120 185 C110 195, 100 200, 85 205" stroke="hsl(165 80% 40% / 0.15)" strokeWidth="1" fill="none" strokeLinecap="round"/>
                  <path d="M180 185 C190 195, 200 200, 215 205" stroke="hsl(165 80% 40% / 0.12)" strokeWidth="1" fill="none" strokeLinecap="round"/>
                  {/* Root nodes */}
                  <circle cx="90" cy="130" r="2" fill="hsl(165 80% 40% / 0.4)"/>
                  <circle cx="205" cy="135" r="2" fill="hsl(165 80% 40% / 0.3)"/>
                  <circle cx="120" cy="185" r="2.5" fill="hsl(165 80% 40% / 0.35)"/>
                  <circle cx="180" cy="185" r="2" fill="hsl(165 80% 40% / 0.25)"/>
                  <circle cx="60" cy="155" r="1.5" fill="hsl(165 80% 40% / 0.2)"/>
                  <circle cx="240" cy="155" r="1.5" fill="hsl(165 80% 40% / 0.15)"/>
                </svg>

                <motion.div
                  className="relative bg-card/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-5 glow-primary"
                  animate={{ boxShadow: [
                    "0 0 20px hsl(165 80% 40% / 0.2), 0 0 60px hsl(165 80% 40% / 0.05)",
                    "0 0 30px hsl(165 80% 40% / 0.3), 0 0 80px hsl(165 80% 40% / 0.1)",
                    "0 0 20px hsl(165 80% 40% / 0.2), 0 0 60px hsl(165 80% 40% / 0.05)",
                  ]}}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <QRCodeSVG
                    value={qrValue}
                    size={200}
                    bgColor="transparent"
                    fgColor="hsl(165, 80%, 40%)"
                    level="M"
                    imageSettings={{
                      src: "",
                      height: 0,
                      width: 0,
                      excavate: false,
                    }}
                  />
                </motion.div>
              </div>

              <p className="text-muted-foreground text-sm mt-8 text-center max-w-[250px]">
                Show this to another wanderer. They scan it to form a root connection.
              </p>
            </motion.div>
          )}

          {mode === "scan" && !connected && (
            <motion.div
              key="scan"
              className="flex flex-col items-center w-full max-w-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="relative w-full rounded-2xl overflow-hidden border border-primary/20 bg-card/40">
                <div id="qr-reader" className="w-full" />
                {connecting && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                    <p className="text-primary font-display">Forming root...</p>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground text-sm mt-4 text-center">
                Point your camera at another wanderer's root code.
              </p>
            </motion.div>
          )}

          {connected && (
            <motion.div
              key="connected"
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <motion.div
                className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center glow-primary mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <Check className="w-8 h-8 text-primary" />
              </motion.div>
              <h2 className="font-display text-2xl text-foreground glow-text mb-2">Rooted!</h2>
              <p className="text-muted-foreground">
                You are now connected with <span className="text-primary">{partnerName}</span>
              </p>
              <p className="text-muted-foreground/60 text-sm mt-1">
                Find them in your connections to start chatting.
              </p>
              <button
                onClick={() => { setConnected(false); setMode("show"); }}
                className="mt-6 px-6 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm"
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            className="absolute bottom-4 left-4 right-4 bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-destructive text-sm">{error}</p>
            <button onClick={() => setError("")} className="text-destructive/60 text-xs mt-1 underline">
              Dismiss
            </button>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Connect;
