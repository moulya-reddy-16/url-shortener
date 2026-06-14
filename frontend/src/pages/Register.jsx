import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { motion } from "framer-motion";
import { Link2, Mail, Lock, User as UserIcon, AlertCircle, ArrowRight, Phone, VenusAndMars } from "lucide-react";
import GlowingBackground from "../components/GlowingBackground.jsx";
import Button from "../components/Button.jsx";
import GlassCard from "../components/GlassCard.jsx";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(name, email, password, "user", gender, phoneNumber);
      toast.success("Account created! Please sign in with your credentials.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed. Try a different email.");
      toast.error(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center bg-bg-app text-text-main px-4 py-6 relative overflow-hidden transition-colors duration-300">
      <GlowingBackground />

      <div className="w-full max-w-2xl space-y-5 z-10">
        
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent shadow-md shadow-primary/10 animate-float">
            <Link2 className="h-5.5 w-5.5 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-text-main">
            Create your account
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            Get started with your custom URL shortening cockpit
          </p>
        </div>

        {/* Auth Card */}
        <GlassCard hoverGlow={true} className="p-6 sm:py-6 sm:px-10">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-500"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* ROW 1: Name and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted/65">
                    <UserIcon className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="block w-full rounded-xl border border-border-custom bg-bg-app/40 py-2.5 pl-10.5 pr-4 text-sm text-text-main placeholder-text-muted/40 outline-none focus:border-primary/50 focus:bg-bg-app transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
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
            </div>

            {/* ROW 2: Gender and Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gender */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Gender
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted/65">
                    <VenusAndMars className="h-4.5 w-4.5" />
                  </span>
                  <select
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="block w-full rounded-xl border border-border-custom bg-bg-app/40 py-2.5 pl-10.5 pr-4 text-sm text-text-main outline-none focus:border-primary/50 focus:bg-bg-app transition-all shadow-sm"
                  >
                    <option value="" disabled hidden>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted/65">
                    <Phone className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 xxxxxxxxxx"
                    className="block w-full rounded-xl border border-border-custom bg-bg-app/40 py-2.5 pl-10.5 pr-4 text-sm text-text-main placeholder-text-muted/40 outline-none focus:border-primary/50 focus:bg-bg-app transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* ROW 3: Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
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
              className="w-full py-3 mt-2"
            >
              Sign Up
            </Button>
          </form>

          {/* Redirect to Login */}
          <div className="mt-5 text-center text-xs text-text-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-primary hover:text-accent transition-colors"
            >
              Sign in
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
