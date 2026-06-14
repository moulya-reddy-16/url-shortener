import { useSearchParams, useNavigate } from "react-router-dom";
import { Timer, EyeOff, FileQuestion, ArrowRight } from "lucide-react";
import GlowingBackground from "../components/GlowingBackground.jsx";
import GlassCard from "../components/GlassCard.jsx";
import Button from "../components/Button.jsx";

export default function ErrorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const msgType = searchParams.get("msg") || "not-found";

  let icon = <FileQuestion className="h-10 w-10 text-text-muted animate-bounce" />;
  let title = "Link Not Found";
  let description = "The shortened URL code you requested does not exist in our database. It might have been deleted or typed incorrectly.";

  if (msgType === "expired") {
    icon = <Timer className="h-10 w-10 text-rose-500 animate-pulse" />;
    title = "Link Expired";
    description = "This campaign link was set to self-destruct or has exceeded its expiration date. Please contact the link creator for a fresh address.";
  } else if (msgType === "inactive") {
    icon = <EyeOff className="h-10 w-10 text-amber-500" />;
    title = "Link Suspended";
    description = "This short link has been manually marked as Inactive or paused by its creator. It is currently offline.";
  }

  return (
    <div className="min-h-[90vh] bg-bg-app text-text-main flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <GlowingBackground />

      <div className="w-full max-w-md z-10">
        <GlassCard hoverGlow={true} className="p-8 text-center animate-slide-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-app border border-border-custom text-text-main mb-6">
            {icon}
          </div>

          <h1 className="text-2xl font-black text-text-main">{title}</h1>
          <p className="text-xs text-text-muted mt-2.5 mb-6 leading-relaxed">
            {description}
          </p>

          <Button
            variant="gradient"
            onClick={() => navigate("/")}
            iconRight={ArrowRight}
            className="w-full py-3"
          >
            Go to Minify Homepage
          </Button>
        </GlassCard>
      </div>
    </div>
  );
}
