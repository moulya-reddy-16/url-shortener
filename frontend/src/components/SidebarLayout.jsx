import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Link2, LayoutDashboard, User, ShieldCheck, LogOut, Sun, Moon, Menu, X
} from "lucide-react";

export default function SidebarLayout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [];
  if (isAdmin) {
    menuItems.push({ name: "Admin Panel", path: "/admin", icon: ShieldCheck });
  } else {
    menuItems.push({ name: "Links Cockpit", path: "/", icon: LayoutDashboard });
  }
  menuItems.push({ name: "Settings", path: "/profile", icon: User });

  const isActive = (path) => location.pathname === path;

  const sidebarVariants = {
    open: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
    closed: { x: "-100%", opacity: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="h-screen bg-bg-app text-text-main flex relative overflow-hidden w-full">
      {/* Background neon blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/5 dark:bg-primary/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary/5 dark:bg-secondary/5 blur-[120px] pointer-events-none"></div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border-custom bg-bg-surface/30 backdrop-blur-xl h-screen sticky top-0 shrink-0 z-30 p-6">
        {/* Brand */}
        <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-2.5 mb-8 text-xl font-bold tracking-tight text-text-main">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent shadow-md shadow-primary/10">
            <Link2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold tracking-tight">Minify</span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5">
          {menuItems.map((item) => {
            const ActiveIcon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer relative ${
                  active 
                    ? "text-primary bg-primary/10 border border-primary/15 shadow-sm shadow-primary/5" 
                    : "text-text-muted hover:text-text-main hover:bg-bg-surface/50 border border-transparent"
                }`}
              >
                <ActiveIcon className="h-4.5 w-4.5" />
                <span>{item.name}</span>
                {active && (
                  <motion.div 
                    layoutId="activeIndicator" 
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-border-custom pt-6 space-y-4">
          {/* Theme Switcher Toggle (Raycast/Arc style switcher) */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold rounded-xl bg-bg-surface/50 border border-border-custom text-text-muted hover:text-text-main hover:border-primary/20 transition-all cursor-pointer"
          >
            <span className="capitalize">{theme} Theme</span>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* User Profile Info Widget */}
          {user && (
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                <User className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-bold text-text-main truncate">{user.name}</p>
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-accent leading-none mt-0.5">{user.role}</p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-text-muted hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex h-16 w-full items-center justify-between px-4 border-b border-border-custom bg-bg-surface/50 backdrop-blur-xl fixed top-0 left-0 right-0 z-40">
        <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-text-main">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-accent">
            <Link2 className="h-4.5 w-4.5 text-white" />
          </div>
          <span>Minify</span>
        </Link>

        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-custom text-text-main bg-bg-surface/50"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Content Drawer */}
            <motion.div
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden fixed top-0 bottom-0 left-0 w-[75vw] max-w-[300px] bg-bg-surface border-r border-border-custom z-50 p-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <Link to={isAdmin ? "/admin" : "/"} onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-text-main">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent">
                    <Link2 className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-extrabold">Minify</span>
                </Link>

                <nav className="space-y-1.5">
                  {menuItems.map((item) => {
                    const ActiveIcon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                          active 
                            ? "text-primary bg-primary/10 border border-primary/15" 
                            : "text-text-muted hover:text-text-main hover:bg-bg-surface/50 border border-transparent"
                        }`}
                      >
                        <ActiveIcon className="h-4.5 w-4.5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-4">
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold rounded-xl bg-bg-surface/50 border border-border-custom text-text-muted"
                >
                  <span className="capitalize">{theme} Theme</span>
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                {user && (
                  <div className="flex items-center gap-3 px-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-text-main truncate">{user.name}</p>
                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-accent mt-0.5">{user.role}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-text-muted hover:text-rose-500 hover:bg-rose-500/10 border border-transparent rounded-xl transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 w-full h-screen flex flex-col md:pt-0 pt-16 relative z-10 overflow-y-auto">
        <div className="flex-1 w-full p-4 sm:p-8 max-w-7xl mx-auto flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
