import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { motion } from "framer-motion";
import { Link2, Sun, Moon } from "lucide-react";
import Button from "./Button.jsx";

export default function Navbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // If user is logged in, they use the SidebarLayout, so Navbar is hidden
  if (user) return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-transparent border-b border-border-custom backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-text-main">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent shadow-md shadow-primary/10">
                <Link2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold tracking-tight">Minify</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-text-muted">
            <a href="#features" className="hover:text-text-main transition-colors">
              Features
            </a>
            <a href="#faq" className="hover:text-text-main transition-colors">
              FAQ
            </a>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button with Motion */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-custom bg-bg-surface/50 text-text-muted hover:text-text-main cursor-pointer"
              title={theme === "dark" ? "Sunrise mode" : "Cyber mode"}
            >
              {theme === "dark" ? (
                <motion.div initial={{ rotate: -45 }} animate={{ rotate: 0 }} transition={{ type: "spring" }}>
                  <Sun className="h-4.5 w-4.5 text-secondary" />
                </motion.div>
              ) : (
                <motion.div initial={{ rotate: 45 }} animate={{ rotate: 0 }} transition={{ type: "spring" }}>
                  <Moon className="h-4.5 w-4.5 text-primary" />
                </motion.div>
              )}
            </motion.button>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/login")}
                className="text-xs px-4 py-2"
              >
                Sign In
              </Button>
              <Button 
                variant="gradient" 
                onClick={() => navigate("/register")}
                className="text-xs px-4 py-2"
              >
                Sign Up Free
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
