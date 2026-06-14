import { Link2 } from "lucide-react";

export default function EmptyState({
  title = "No data found",
  description = "Get started by performing an action.",
  action = null
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="relative mb-6">
        {/* Glow circles */}
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl transform scale-150"></div>
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/20 to-accent/20 border border-primary/30 text-primary shadow-xl">
          <Link2 className="h-10 w-10 animate-float" />
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-text-main mb-1.5">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-6 leading-relaxed">{description}</p>
      
      {action}
    </div>
  );
}
