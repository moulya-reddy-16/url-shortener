import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { motion } from "framer-motion";
import { Link2, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import GlowingBackground from "../components/GlowingBackground.jsx";
import Button from "../components/Button.jsx";
import GlassCard from "../components/GlassCard.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid credentials");
      toast.error(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center bg-bg-app text-text-main px-4 py-8 relative overflow-hidden transition-colors duration-300">
      <GlowingBackground />

      <div className="w-full max-w-md space-y-6 z-10">
        
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent shadow-md shadow-primary/10 animate-float">
            <Link2 className="h-5.5 w-5.5 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-text-main">
            Welcome back
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            Sign in to manage and minify your links
          </p>
        </div>

        {/* Auth Card */}
        <GlassCard hoverGlow={true} className="p-6 sm:p-10">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500"
            >
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form className="space-y-4.5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted/65">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="block w-full rounded-xl border border-border-custom bg-bg-app/40 py-2.5 pl-10.5 pr-4 text-sm text-text-main placeholder-text-muted/40 outline-none focus:border-primary/50 focus:bg-bg-app transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted/65">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-border-custom bg-bg-app/40 py-2.5 pl-10.5 pr-4 text-sm text-text-main placeholder-text-muted/40 outline-none focus:border-primary/50 focus:bg-bg-app transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="gradient"
              disabled={loading}
              loading={loading}
              iconRight={ArrowRight}
              className="w-full py-3"
            >
              Sign In
            </Button>
          </form>

          {/* Redirect to Register */}
          <div className="mt-6 text-center text-xs text-text-muted">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-primary hover:text-accent transition-colors"
            >
              Sign up free
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
