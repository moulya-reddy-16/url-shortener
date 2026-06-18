import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api, HOST_URL, getShortUrlPrefix } from "../utils/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { 
  ArrowLeft, Globe, Laptop, ExternalLink,
  BookOpen, Film, Plane, Briefcase, ShoppingBag, HelpCircle, Info,
  TrendingUp, Clock, Compass, Activity, AlertTriangle
} from "lucide-react";
import GlassCard from "../components/GlassCard.jsx";
import Button from "../components/Button.jsx";
import { ChartSkeleton, CardSkeleton } from "../components/LoadingSkeleton.jsx";

const CATEGORY_ICONS = {
  Study: BookOpen,
  Entertainment: Film,
  Travel: Plane,
  Work: Briefcase,
  Shopping: ShoppingBag,
  Other: HelpCircle,
};

const CATEGORY_COLORS = {
  Study: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Entertainment: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  Travel: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  Work: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Shopping: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Other: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export default function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { theme } = useTheme();
  const { networkIp } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async (isSilent = false) => {
      try {
        const res = await api(`/url/analytics/${id}`);
        setData(res);
      } catch (err) {
        if (!isSilent) {
          setError(err.message || "Failed to load analytics");
          toast.error("Error loading analytics.");
        }
      } finally {
        if (!isSilent) {
          setLoading(false);
        }
      }
    };
    
    // Initial fetch
    fetchAnalytics(false);

    // Auto-poll every 5 seconds for live analytics updates
    const intervalId = setInterval(() => fetchAnalytics(true), 5000);
    
    return () => clearInterval(intervalId);
  }, [id, toast]);

  if (loading) {
    return (
      <div className="space-y-8 w-full">
        <div className="h-6 w-32 bg-text-muted/15 rounded-lg animate-pulse mb-4"></div>
        <ChartSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-rose-500 animate-float" />
        <span className="font-bold text-text-main text-lg">{error || "URL statistics not found"}</span>
        <Button variant="outline" onClick={() => navigate("/")} icon={ArrowLeft} className="text-xs px-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const { stats, clicks, originalUrl, shortCode, category, createdAt, expiresAt, isActive } = data;
  const CategoryIcon = CATEGORY_ICONS[category] || HelpCircle;

  // Helper to convert stats objects to sorted percentage arrays
  const getStatsArray = (statsObj) => {
    const totalCount = Object.values(statsObj).reduce((a, b) => a + b, 0);
    return Object.entries(statsObj)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const browserStatsArray = getStatsArray(stats.browsers);
  const deviceStatsArray = getStatsArray(stats.devices);
  const countryStatsArray = getStatsArray(stats.countries);
  const cityStatsArray = getStatsArray(stats.cities);

  // Daily Click Trend aggregation for SVG Line Chart
  const clicksByDateArray = stats.clicksByDate 
    ? Object.entries(stats.clicksByDate).map(([date, count]) => ({ date, count }))
    : [];

  // SVG Chart Calculation config
  const chartWidth = 600;
  const chartHeight = 240;
  const chartPadding = 40;
  
  let svgPath = "";
  let svgAreaPath = "";
  let chartPoints = [];

  if (clicksByDateArray.length > 1) {
    const maxCount = Math.max(...clicksByDateArray.map(p => p.count), 5);
    const usableWidth = chartWidth - 2 * chartPadding;
    const usableHeight = chartHeight - 2 * chartPadding;

    chartPoints = clicksByDateArray.map((point, index) => {
      const x = chartPadding + (index * usableWidth) / (clicksByDateArray.length - 1);
      const y = chartHeight - chartPadding - (point.count * usableHeight) / maxCount;
      return { x, y, count: point.count, date: point.date };
    });

    svgPath = `M ${chartPoints[0].x} ${chartPoints[0].y} ` + 
      chartPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");

    svgAreaPath = `${svgPath} L ${chartPoints[chartPoints.length - 1].x} ${chartHeight - chartPadding} L ${chartPoints[0].x} ${chartHeight - chartPadding} Z`;
  }

  return (
    <div className="space-y-8 w-full text-left">
      
      {/* Header Back Link & Timestamp */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-text-main transition-colors bg-bg-surface/30 border border-border-custom px-4 py-2.5 rounded-xl shadow-sm backdrop-blur-xl w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cockpit
        </Link>

        <span className="text-xs text-text-muted font-semibold flex items-center gap-1.5 self-start sm:self-auto">
          <Clock className="h-4 w-4 text-primary" />
          Created {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* URL Information Header Card */}
      <GlassCard hoverGlow={false} className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-glass-bg/30">
        <div className="flex-1 min-w-0">
          <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full border mb-3 ${CATEGORY_COLORS[category]}`}>
            <CategoryIcon className="h-3 w-3" />
            {category}
          </span>
          <h1 className="text-2xl font-black text-text-main flex items-center gap-2">
            {shortCode}
            <a 
              href={`${getShortUrlPrefix(networkIp)}${shortCode}`} 
              target="_blank" 
              rel="noreferrer"
              className="text-primary hover:text-accent transition-colors"
              title="Visit Redirect Link"
            >
              <ExternalLink className="h-4.5 w-4.5" />
            </a>
          </h1>
          <p className="text-xs text-text-muted break-all mt-1">{originalUrl}</p>
        </div>

        <div className="flex flex-wrap gap-4 border-t border-border-custom md:border-t-0 pt-4 md:pt-0 shrink-0">
          <div className="bg-bg-app/40 border border-border-custom rounded-2xl py-3 px-5 text-center min-w-[90px] shadow-sm">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">Total Clicks</span>
            <span className="text-2xl font-black text-text-main mt-0.5 block leading-none">{clicks}</span>
          </div>

          <div className="bg-bg-app/40 border border-border-custom rounded-2xl py-3 px-5 text-center min-w-[90px] shadow-sm">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">Status</span>
            <span className={`text-xs font-black mt-2 block leading-none ${isActive ? "text-emerald-500" : "text-rose-500"}`}>
              {isActive ? "ACTIVE" : "PAUSED"}
            </span>
          </div>

          <div className="bg-bg-app/40 border border-border-custom rounded-2xl py-3 px-5 text-center min-w-[90px] shadow-sm">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">Expiration</span>
            <span className="text-xs font-semibold text-primary mt-2 block leading-none">
              {expiresAt ? new Date(expiresAt).toLocaleDateString() : "Never"}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Daily click trends line chart */}
      <GlassCard hoverGlow={true} className="p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-6 flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-primary" />
          Click Performance Trend
        </h2>

        {clicksByDateArray.length < 2 ? (
          <div className="py-16 text-center text-xs text-text-muted flex flex-col items-center justify-center gap-2">
            <Info className="h-6 w-6 text-text-muted/60" />
            <span>Not enough daily activity logged yet. Click stats will appear once the short URL is shared.</span>
          </div>
        ) : (
          <div className="relative w-full overflow-hidden">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="primary-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="50%" stopColor="var(--color-secondary)" />
                  <stop offset="100%" stopColor="var(--color-accent)" />
                </linearGradient>
                <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Guidelines */}
              <line x1={chartPadding} y1={chartPadding} x2={chartWidth - chartPadding} y2={chartPadding} stroke="var(--border-color)" strokeDasharray="3 3" />
              <line x1={chartPadding} y1={chartHeight / 2} x2={chartWidth - chartPadding} y2={chartHeight / 2} stroke="var(--border-color)" strokeDasharray="3 3" />
              <line x1={chartPadding} y1={chartHeight - chartPadding} x2={chartWidth - chartPadding} y2={chartHeight - chartPadding} stroke="var(--border-color)" />

              {/* Area path */}
              <path d={svgAreaPath} fill="url(#area-grad)" />

              {/* Line path */}
              <path d={svgPath} fill="none" stroke="url(#primary-grad)" strokeWidth="3" strokeLinecap="round" />

              {/* Point circles */}
              {chartPoints.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPoint?.idx === idx ? 6 : 4}
                  fill={theme === "dark" ? "#13131A" : "#fff"}
                  stroke={hoveredPoint?.idx === idx ? "var(--color-accent)" : "var(--color-primary)"}
                  strokeWidth="3"
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredPoint({ idx, ...p })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div 
                className="absolute bg-bg-surface/95 border border-border-custom text-text-main p-2.5 rounded-lg shadow-xl text-[10px] pointer-events-none z-10"
                style={{ 
                  left: `${(hoveredPoint.x / chartWidth) * 100}%`, 
                  top: `${(hoveredPoint.y / chartHeight) * 100 - 20}%`,
                  transform: "translate(-50%, -50%)" 
                }}
              >
                <span className="block font-bold text-text-muted">{new Date(hoveredPoint.date).toLocaleDateString()}</span>
                <span className="block font-black text-primary text-xs mt-0.5">{hoveredPoint.count} click(s)</span>
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Device & Browser Share */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Device Share */}
        <GlassCard hoverGlow={false} className="bg-glass-bg/30">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-6 flex items-center gap-1.5">
            <Laptop className="h-4 w-4 text-primary" />
            Device Share
          </h2>

          {deviceStatsArray.length === 0 ? (
            <p className="text-xs text-text-muted py-10 text-center">No visitor device statistics recorded.</p>
          ) : (
            <div className="space-y-4.5">
              {deviceStatsArray.map((dev) => (
                <div key={dev.name}>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-text-main">{dev.name}</span>
                    <span className="text-text-muted">{dev.count} click(s) ({dev.percentage}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-bg-app border border-border-custom overflow-hidden">
                    <div 
                      style={{ width: `${dev.percentage}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent shadow-sm"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Browser Share */}
        <GlassCard hoverGlow={false} className="bg-glass-bg/30">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-6 flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-secondary" />
            Browser Share
          </h2>

          {browserStatsArray.length === 0 ? (
            <p className="text-xs text-text-muted py-10 text-center">No browser statistics recorded.</p>
          ) : (
            <div className="space-y-4.5">
              {browserStatsArray.map((brow) => (
                <div key={brow.name}>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-text-main">{brow.name}</span>
                    <span className="text-text-muted">{brow.count} click(s) ({brow.percentage}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-bg-app border border-border-custom overflow-hidden">
                    <div 
                      style={{ width: `${brow.percentage}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-secondary to-accent shadow-sm"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Geography Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Countries list */}
        <GlassCard hoverGlow={false} className="bg-glass-bg/30">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-6 flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-primary" />
            Top Countries
          </h2>
          {countryStatsArray.length === 0 ? (
            <p className="text-xs text-text-muted py-10 text-center">No country geolocation logs.</p>
          ) : (
            <div className="divide-y divide-border-custom">
              {countryStatsArray.map((c, index) => (
                <div key={c.name} className="flex justify-between py-3.5 text-xs font-semibold">
                  <span className="text-text-main flex items-center gap-2">
                    <span className="text-text-muted w-4">#{index + 1}</span>
                    {c.name}
                  </span>
                  <span className="text-text-muted font-bold">{c.count} clicks</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Cities list */}
        <GlassCard hoverGlow={false} className="bg-glass-bg/30">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-6 flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-secondary" />
            Top Cities
          </h2>
          {cityStatsArray.length === 0 ? (
            <p className="text-xs text-text-muted py-10 text-center">No city geolocation logs.</p>
          ) : (
            <div className="divide-y divide-border-custom">
              {cityStatsArray.map((c, index) => (
                <div key={c.name} className="flex justify-between py-3.5 text-xs font-semibold">
                  <span className="text-text-main flex items-center gap-2">
                    <span className="text-text-muted w-4">#{index + 1}</span>
                    {c.name}
                  </span>
                  <span className="text-text-muted font-bold">{c.count} clicks</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Visitor Click Log Feed */}
      <GlassCard hoverGlow={false} className="p-0 overflow-hidden bg-glass-bg/30">
        <div className="px-6 py-5 border-b border-border-custom flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-primary animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">Live Activity Stream (Last 10 Clicks)</h2>
        </div>

        {!stats.recentClicks || stats.recentClicks.length === 0 ? (
          <p className="text-xs text-text-muted py-12 text-center">No visitor clicks recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-medium text-text-main">
              <thead className="bg-bg-app/40 border-b border-border-custom text-[10px] font-bold uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Country</th>
                  <th className="py-3.5 px-6">City</th>
                  <th className="py-3.5 px-6">Browser</th>
                  <th className="py-3.5 px-6">Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom bg-transparent">
                {stats.recentClicks.map((click, i) => (
                  <tr key={i} className="hover:bg-bg-surface/25 transition-colors">
                    <td className="py-3.5 px-6 text-text-muted">
                      {new Date(click.clickedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-text-main">{click.country}</td>
                    <td className="py-3.5 px-6 font-bold text-text-main">{click.city}</td>
                    <td className="py-3.5 px-6 text-text-muted">{click.browser}</td>
                    <td className="py-3.5 px-6">
                      <span className="py-0.5 px-2 bg-primary/10 border border-primary/20 rounded text-[9px] font-bold text-primary">
                        {click.device}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

    </div>
  );
}
