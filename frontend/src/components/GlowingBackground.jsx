import { useTheme } from "../context/ThemeContext.jsx";

export default function GlowingBackground() {
  const { theme } = useTheme();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {theme === "dark" ? (
        <>
          {/* Cyber Galaxy Background Elements */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#8B5CF6]/15 blur-[120px] animate-rotate-aurora-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#06B6D4]/15 blur-[120px] animate-rotate-aurora-fast"></div>
          <div className="absolute top-[30%] right-[20%] w-[35vw] h-[35vw] rounded-full bg-[#EC4899]/8 blur-[100px]"></div>
          
          {/* Futuristic subtle star field grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(var(--color-primary) 1px, transparent 1px), radial-gradient(var(--color-secondary) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
              backgroundPosition: "0 0, 20px 20px"
            }}
          ></div>
        </>
      ) : (
        <>
          {/* Sunrise Glass Background Elements */}
          <div className="absolute top-[-5%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-[#FF6B35]/8 blur-[100px] animate-rotate-aurora-slow"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-[#FFB703]/10 blur-[100px] animate-rotate-aurora-fast"></div>
          <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] rounded-full bg-[#3A86FF]/6 blur-[80px]"></div>
          
          {/* Soft premium warm grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(var(--color-primary) 1.5px, transparent 1.5px)`,
              backgroundSize: "24px 24px"
            }}
          ></div>
        </>
      )}
    </div>
  );
}
