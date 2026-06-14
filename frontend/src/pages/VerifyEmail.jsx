import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../utils/api.js";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import GlowingBackground from "../components/GlowingBackground.jsx";
import GlassCard from "../components/GlassCard.jsx";
import Button from "../components/Button.jsx";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        await api(`/auth/verify-email/${token}`);
        setSuccess(true);
        // Clear local storage user copy to force re-fetch of verified flag on login if already logged in
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } catch (err) {
        setError(err.message || "Email verification failed. Token might be invalid or expired.");
      } finally {
        setLoading(false);
      }
    };
    confirmEmail();
  }, [token]);

  return (
    <div className="min-h-[90vh] bg-bg-app text-text-main flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <GlowingBackground />

      <div className="w-full max-w-md z-10">
        <GlassCard hoverGlow={true} className="p-8 text-center animate-slide-in">
          {loading ? (
            <div className="space-y-4 py-8">
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
              <h1 className="text-xl font-bold text-text-main">Verifying Account...</h1>
              <p className="text-xs text-text-muted">Communicating with Minify core routers.</p>
            </div>
          ) : success ? (
            <div className="space-y-6 py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-450">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-text-main">Email Verified!</h1>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">
                  Thank you for verifying your email. Your account is now fully active with complete SaaS features unlocked.
                </p>
              </div>
              <Button
                variant="gradient"
                onClick={() => navigate("/login")}
                iconRight={ArrowRight}
                className="w-full py-3"
              >
                Sign In to Cockpit
              </Button>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500">
                <XCircle className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-text-main">Verification Failed</h1>
                <p className="text-xs text-rose-455 mt-2 leading-relaxed">
                  {error}
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-main transition-colors"
              >
                Back to Login
              </Link>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
