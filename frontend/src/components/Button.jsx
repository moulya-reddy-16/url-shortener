import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "gradient",
  className = "",
  disabled = false,
  loading = false,
  icon: Icon = null,
  iconRight: IconRight = null,
  ...props
}) {
  // Styles based on variants
  const baseStyle = "relative inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-xl px-5 py-2.5 transition-all outline-none focus:ring-2 focus:ring-primary/45 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden shadow-sm";
  
  const variants = {
    gradient: "bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white shadow-md shadow-primary/15 border border-primary/20",
    secondary: "bg-gradient-to-r from-secondary to-accent hover:opacity-95 text-white shadow-md shadow-secondary/15 border border-secondary/20",
    glass: "glass bg-glass-bg/60 hover:bg-glass-bg text-text-main border border-glass-border hover:border-primary/30",
    outline: "border border-border-custom bg-transparent text-text-main hover:bg-bg-surface/50 hover:border-primary/40",
    ghost: "bg-transparent text-text-muted hover:text-text-main hover:bg-bg-surface/40",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
      {!loading && Icon && <Icon className="h-4 w-4 text-current" />}
      <span className="relative z-10">{children}</span>
      {!loading && IconRight && <IconRight className="h-4 w-4 text-current" />}
    </motion.button>
  );
}
