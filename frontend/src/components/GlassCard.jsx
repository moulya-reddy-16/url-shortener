import { motion } from "framer-motion";

export default function GlassCard({
  children,
  className = "",
  hoverGlow = true,
  delay = 0,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`glass rounded-3xl p-6 shadow-md border border-glass-border hover:border-glass-border/80 transition-all duration-300 relative overflow-hidden ${
        hoverGlow ? "hover:shadow-neon hover:border-primary/20" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
