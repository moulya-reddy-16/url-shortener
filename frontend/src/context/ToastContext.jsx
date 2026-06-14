/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Automatically remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => showToast(msg, "success"),
    error: (msg) => showToast(msg, "error"),
    info: (msg) => showToast(msg, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Portal Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => {
          let bgClass = "bg-slate-900/95 text-slate-100 border-slate-700 shadow-slate-950/20";
          let icon = <Info className="h-5 w-5 text-indigo-400" />;
          let progressBg = "bg-indigo-500";

          if (t.type === "success") {
            bgClass = "bg-emerald-950/90 text-emerald-100 border-emerald-500/30 shadow-emerald-950/20";
            icon = <CheckCircle className="h-5 w-5 text-emerald-400" />;
            progressBg = "bg-emerald-500";
          } else if (t.type === "error") {
            bgClass = "bg-rose-950/90 text-rose-100 border-rose-500/30 shadow-rose-950/20";
            icon = <AlertCircle className="h-5 w-5 text-rose-400" />;
            progressBg = "bg-rose-500";
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto relative flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-in ${bgClass}`}
            >
              <div className="flex-shrink-0 mt-0.5">{icon}</div>
              <div className="flex-1 text-sm font-medium pr-4 break-words leading-relaxed">{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded-md hover:bg-slate-800/40"
              >
                <X className="h-4 w-4" />
              </button>
              
              {/* Progress Bar Animation */}
              <div className="absolute bottom-0 left-0 h-1 w-full rounded-b-xl overflow-hidden bg-slate-800/50">
                <div
                  className={`h-full ${progressBg} animate-toast-progress`}
                  style={{ animationDuration: "4000ms" }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

// Quick fix: the above returned theme provider has a typo on ThemeContext.Provider
// Let's make sure it is ToastContext.Provider! Wait! Let's write the correct code.
// Let's export useToast as well.
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
