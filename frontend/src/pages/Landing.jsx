import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Link2, Sparkles, BarChart3, Globe, Shield, QrCode, ArrowRight, Check, Layers, Zap, ChevronDown
} from "lucide-react";
import GlowingBackground from "../components/GlowingBackground.jsx";
import Button from "../components/Button.jsx";
import GlassCard from "../components/GlassCard.jsx";

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [mockedUrl, setMockedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);

  const handleMockShorten = (e) => {
    e.preventDefault();
    if (!inputValue) return;
    setLoading(true);
    setTimeout(() => {
      setMockedUrl(`http://minify.click/r/demo-${Math.floor(Math.random() * 900) + 100}`);
      setLoading(false);
    }, 800);
  };

  const handleCopy = () => {
    if (!mockedUrl) return;
    navigator.clipboard.writeText(mockedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    {
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      title: "Real-Time Deep Analytics",
      description: "Understand your audience with click summaries, geographical tracking (country/city), and device/browser statistics."
    },
    {
      icon: <Layers className="h-6 w-6 text-secondary" />,
      title: "Custom Branded Aliases",
      description: "Replace random strings with memorable, custom branded short codes that boost your click-through rates by up to 34%."
    },
    {
      icon: <Shield className="h-6 w-6 text-accent" />,
      title: "Password-Protected Links",
      description: "Add an extra layer of security. Keep your private files, documents, and content safe behind hashed passwords."
    },
    {
      icon: <QrCode className="h-6 w-6 text-primary" />,
      title: "Auto-Generated QR Codes",
      description: "Instantly create high-resolution QR codes for every shortened URL. Download and share on flyers, packaging, or brochures."
    },
    {
      icon: <Zap className="h-6 w-6 text-secondary" />,
      title: "Link Expiration Limits",
      description: "Set self-destruct timers or exact expiration dates for temporary campaigns, limited offers, or seasonal product links."
    },
    {
      icon: <Globe className="h-6 w-6 text-accent" />,
      title: "Bulk Shortening Console",
      description: "Shorten up to 10 destination URLs in a single action. Save massive time while launching high-volume campaigns."
    }
  ];

  const faqs = [
    {
      q: "What makes Minify different from standard URL shorteners?",
      a: "Minify is designed as a developer-friendly, high-performance link cockpit. We provide completely free access to custom alias branding, bulk shortening, geo/device analytics, downloadable QR codes, password protection, and expiration dates — all wrapped in a sleek, modern UI."
    },
    {
      q: "Are custom aliases and QR codes completely free?",
      a: "Yes! Unlike other services that charge for custom branded aliases or downloading high-quality QR codes, Minify offers all advanced settings free of charge."
    },
    {
      q: "How does password protection for links work?",
      a: "When you protect a link with a password, Minify hashes it using bcrypt on the server. If a visitor clicks the link, they are directed to a clean unlock gate to input the correct password before being safely redirected to the destination URL."
    },
    {
      q: "Can I track analytics in real time?",
      a: "Yes! Every single click triggers dynamic geocoding and device/agent parsing. Your Analytics cockpit updates instantly with Line charts, donut diagrams, and live clicks feed logs."
    }
  ];

  return (
    <div className="relative min-h-screen bg-bg-app text-text-main overflow-x-hidden flex flex-col font-sans transition-colors duration-300">
      <GlowingBackground />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 sm:pt-32 lg:pt-40 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border-custom bg-bg-surface/50 px-4 py-1.5 text-xs font-semibold text-primary mb-8"
          >
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span>Introducing Developer-Grade Link Cockpit</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-5xl text-5xl font-black tracking-tight text-text-main sm:text-7xl md:text-8xl leading-none"
          >
            Shorten your links. <br />
            <span className="text-gradient-primary">Amplify your reach.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-sm sm:text-base text-text-muted leading-relaxed"
          >
            Minify is a modern, high-tech platform designed for custom branded links, instant QR codes, password security layers, and real-time geocoded metrics. 100% free forever.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            {user ? (
              <Button
                variant="gradient"
                onClick={() => navigate("/")}
                iconRight={ArrowRight}
                className="px-8 py-3.5 text-base"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="gradient"
                  onClick={() => navigate("/register")}
                  iconRight={ArrowRight}
                  className="px-8 py-3.5 text-base"
                >
                  Start For Free
                </Button>
                <Button
                  variant="glass"
                  onClick={() => navigate("/login")}
                  className="px-6 py-3.5 text-base"
                >
                  Sign In
                </Button>
              </>
            )}
          </motion.div>

          {/* Interactive Demo Shortener Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 w-full max-w-2xl relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-3xl blur-2xl opacity-50"></div>
            <GlassCard hoverGlow={true} className="relative z-10 p-6 sm:p-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4 text-left flex items-center gap-2">
                <Link2 className="h-4.5 w-4.5 text-primary" />
                Live Demo: Shorten a link instantly
              </h3>
              
              <form onSubmit={handleMockShorten} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  required
                  placeholder="https://example.com/very/long/campaign/details"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="block flex-1 rounded-xl border border-border-custom bg-bg-app/40 py-3.5 px-4 text-sm text-text-main placeholder-text-muted/50 outline-none focus:border-primary/50 focus:bg-bg-app transition-all"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={loading}
                  className="px-6 py-3.5 text-sm"
                >
                  {loading ? "Minifying..." : "Shorten URL"}
                </Button>
              </form>

              <AnimatePresence>
                {mockedUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 text-left flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div className="flex-1 w-full truncate">
                      <span className="block text-[9px] font-extrabold uppercase tracking-wider text-primary mb-1">
                        Your Short Link (Demo Mode)
                      </span>
                      <a
                        href={mockedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-text-main hover:text-primary transition-colors truncate block"
                      >
                        {mockedUrl}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Button
                        variant="glass"
                        onClick={handleCopy}
                        icon={copied ? Check : null}
                        className="text-xs px-4 py-2 flex-1 sm:flex-none"
                      >
                        {copied ? "Copied" : "Copy Link"}
                      </Button>
                      <Button
                        variant="gradient"
                        onClick={() => navigate("/register")}
                        className="text-xs px-4 py-2 flex-1 sm:flex-none"
                      >
                        Claim Analytics
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-border-custom bg-bg-surface/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
              Advanced Link Engine
            </h2>
            <h3 className="text-3xl font-extrabold text-text-main sm:text-4xl">
              Everything you need to orchestrate campaigns
            </h3>
            <p className="text-sm text-text-muted mt-4">
              Get memory-efficient custom aliases, real-time geocoded analytics, password protect barriers, and high-performance router setups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, index) => (
              <GlassCard 
                key={index}
                delay={index * 0.05}
                hoverGlow={true}
                className="group flex flex-col items-start text-left p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-app border border-border-custom group-hover:scale-105 transition-all text-primary">
                  {feat.icon}
                </div>
                <h4 className="text-lg font-bold text-text-main mt-5 mb-2">{feat.title}</h4>
                <p className="text-sm text-text-muted leading-relaxed flex-1">{feat.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t border-border-custom relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-accent mb-3">
              Frequently Asked Questions
            </h2>
            <h3 className="text-3xl font-extrabold text-text-main sm:text-4xl">
              Common Questions & Answers
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <GlassCard 
                key={i} 
                hoverGlow={false} 
                className="p-5 cursor-pointer"
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              >
                <div className="flex items-center justify-between gap-4 select-none">
                  <h4 className="text-sm sm:text-base font-bold text-text-main">{faq.q}</h4>
                  <ChevronDown className={`h-5 w-5 text-text-muted transition-transform shrink-0 ${faqOpen === i ? "rotate-180 text-primary" : ""}`} />
                </div>
                
                <AnimatePresence initial={false}>
                  {faqOpen === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs sm:text-sm text-text-muted mt-4 border-t border-border-custom pt-3.5 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-24 relative z-10 overflow-hidden text-center border-t border-border-custom bg-bg-surface/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <h3 className="text-3xl font-black text-text-main sm:text-5xl">
              Ready to claim your cockpit?
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-sm text-text-muted leading-relaxed">
              Get advanced custom aliases, detailed country click analytics, password protection gates, and high-performance routing today.
            </p>
            <div className="mt-8">
              <Button
                variant="gradient"
                onClick={() => navigate("/register")}
                iconRight={ArrowRight}
                className="px-8 py-4 text-base"
              >
                Create Free Account
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-16 bg-bg-surface/40 text-text-muted border-t border-border-custom relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent shadow-md shadow-primary/10">
                <Link2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold text-text-main text-lg tracking-tight">Minify</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Premium link redirection cockpit for developers, creators, and modern teams.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-text-main">Product</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-text-main transition-colors">Features</a></li>
              <li><a href="#faq" className="hover:text-text-main transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-text-main">Resources</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-text-main transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-text-main transition-colors">Sign Up</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-text-main">Company</h5>
            <p className="text-xs leading-relaxed text-text-muted">
              Built with precision for modern portfolios and Dribbble-level SaaS standards.
            </p>
            <p className="text-xs font-bold text-text-main mt-4">
              &copy; {new Date().getFullYear()} Minify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
