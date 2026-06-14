import { useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../utils/api.js";
import { ShieldAlert, KeyRound, ArrowRight } from "lucide-react";
import GlowingBackground from "../components/GlowingBackground.jsx";
import GlassCard from "../components/GlassCard.jsx";
import Button from "../components/Button.jsx";

export default function UnlockLink() {
  const { shortCode } = useParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api(`/url/unlock/${shortCode}`, {
        method: "POST",
        body: { password },
      });
      window.location.href = res.originalUrl;
    } catch (err) {
      setError(err.message || "Incorrect password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] bg-bg-app text-text-main flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <GlowingBackground />

      <div className="w-full max-w-md z-10">
        <GlassCard hoverGlow={true} className="p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-6 animate-pulse-ring">
            <KeyRound className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-black text-text-main mb-2">Link is Protected</h1>
          <p className="text-xs text-text-muted mb-6 leading-relaxed">
            This shortened link (<span className="text-primary font-semibold">{shortCode}</span>) is password protected. Enter the correct password to gain access.
          </p>

          {error && (
            <div className="mb-4 text-xs font-semibold border border-red-500/20 bg-red-500/10 text-red-500 p-3 rounded-xl flex items-center gap-2 text-left">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                required
                placeholder="Enter link password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-border-custom bg-bg-app/40 py-2.5 px-4 text-sm text-text-main placeholder-text-muted/40 outline-none focus:border-primary/50 focus:bg-bg-app transition-all"
              />
            </div>

            <Button
              type="submit"
              variant="gradient"
              disabled={loading}
              loading={loading}
              iconRight={ArrowRight}
              className="w-full py-3"
            >
              Decrypt & Redirect
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
