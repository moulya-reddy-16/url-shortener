import { useState, useEffect } from "react";
import { api, HOST_URL } from "../utils/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { 
  ShieldCheck, Globe, Link2, Users, BarChart3, Trash2, Search
} from "lucide-react";
import GlassCard from "../components/GlassCard.jsx";
import { CardSkeleton, RowSkeleton } from "../components/LoadingSkeleton.jsx";

export default function AdminDashboard() {
  const toast = useToast();
  const { networkIp } = useAuth();
  const [stats, setStats] = useState(null);
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsData = await api("/url/admin/analytics");
        setStats(statsData);

        const urlsData = await api("/url/admin/all");
        setUrls(urlsData.data || []);
      } catch {
        toast.error("Failed to load administration workspace stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [toast]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this link? (Admin deletion cannot be undone)")) return;
    try {
      await api(`/url/admin/${id}`, { method: "DELETE" });
      setUrls((prev) => prev.filter((url) => url._id !== id));
      toast.success("Moderated link deleted successfully!");
      
      const statsData = await api("/url/admin/analytics");
      setStats(statsData);
    } catch (err) {
      toast.error(err.message || "Failed to moderate URL.");
    }
  };

  const filteredUrls = urls.filter((url) => {
    return (
      url.shortCode.toLowerCase().includes(search.toLowerCase()) ||
      url.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
      url.createdBy?.name.toLowerCase().includes(search.toLowerCase()) ||
      url.createdBy?.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-8 w-full text-left">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-text-main flex items-center gap-2.5">
          <ShieldCheck className="h-8 w-8 text-primary" />
          Admin Moderation
        </h1>
        <p className="text-sm text-text-muted">
          Monitor platform usage metrics, view category counts, and remove offending links.
        </p>
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <CardSkeleton />
          <RowSkeleton />
        </>
      ) : (
        <>
          {/* Platform Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Total URLs */}
            <GlassCard hoverGlow={false} className="flex items-center gap-4 py-5 bg-glass-bg/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                <Link2 className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Total links</span>
                <span className="text-3xl font-black text-text-main leading-none mt-1 block">{stats?.totalUrls || 0}</span>
              </div>
            </GlassCard>

            {/* Total Users */}
            <GlassCard hoverGlow={false} className="flex items-center gap-4 py-5 bg-glass-bg/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary border border-secondary/20 shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Registered Users</span>
                <span className="text-3xl font-black text-text-main leading-none mt-1 block">{stats?.totalUsers || 0}</span>
              </div>
            </GlassCard>

            {/* Total Clicks */}
            <GlassCard hoverGlow={false} className="flex items-center gap-4 py-5 bg-glass-bg/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent border border-accent/20 shrink-0">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Platform Clicks</span>
                <span className="text-3xl font-black text-text-main leading-none mt-1 block">{stats?.totalClicks || 0}</span>
              </div>
            </GlassCard>
          </div>

          {/* Categories Share */}
          <GlassCard hoverGlow={false} className="bg-glass-bg/30">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-6 flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-primary" />
              URL Category Share
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(stats?.categoryStats || {}).map(([name, count]) => (
                <div key={name} className="rounded-xl border border-border-custom bg-bg-app/40 p-4 text-center shadow-inner">
                  <span className="block text-[10px] font-bold uppercase text-text-muted">{name}</span>
                  <span className="text-lg font-black text-text-main mt-1 block leading-none">{count}</span>
                </div>
              ))}
              {Object.keys(stats?.categoryStats || {}).length === 0 && (
                <p className="col-span-full text-center text-xs text-text-muted py-2">No category logs available.</p>
              )}
            </div>
          </GlassCard>

          {/* Global URL List Table */}
          <GlassCard hoverGlow={false} className="p-0 overflow-hidden bg-glass-bg/30">
            <div className="px-6 py-5 border-b border-border-custom flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">Platform URL Moderation</h2>
              
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted/65">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search alias, original, owner..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-64 rounded-xl border border-border-custom bg-bg-app/40 py-2 pl-9 pr-4 text-xs text-text-main outline-none focus:border-primary/50"
                />
              </div>
            </div>

            {filteredUrls.length === 0 ? (
              <p className="text-xs text-text-muted py-12 text-center">No platform URLs match search query.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs font-medium text-text-main">
                  <thead className="bg-bg-app/40 border-b border-border-custom text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    <tr>
                      <th className="py-3.5 px-6">Short Code</th>
                      <th className="py-3.5 px-6">Destination URL</th>
                      <th className="py-3.5 px-6">Created By</th>
                      <th className="py-3.5 px-6">Clicks</th>
                      <th className="py-3.5 px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom bg-transparent">
                    {filteredUrls.map((url) => (
                      <tr key={url._id} className="hover:bg-bg-surface/25 transition-colors">
                        <td className="py-3.5 px-6 font-extrabold text-text-main">
                          <a 
                            href={`${import.meta.env.VITE_API_BASE_URL ? HOST_URL : `http://${window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? networkIp : window.location.hostname}:5000`}/api/url/r/${url.shortCode}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="hover:text-primary hover:underline flex items-center gap-1.5"
                          >
                            {url.shortCode}
                          </a>
                        </td>
                        <td className="py-3.5 px-6 max-w-xs truncate text-text-muted" title={url.originalUrl}>
                          {url.originalUrl}
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-text-main">{url.createdBy?.name || "Deleted User"}</span>
                            <span className="text-[9px] text-text-muted">{url.createdBy?.email || ""}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 font-extrabold text-text-main">{url.clicks}</td>
                        <td className="py-3.5 px-6">
                          <button
                            onClick={() => handleDelete(url._id)}
                            className="p-2 rounded-lg border border-border-custom bg-bg-app/40 text-text-muted hover:text-rose-500 hover:border-rose-500/20 transition-all cursor-pointer"
                            title="Moderate Delete Link"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </>
      )}

    </div>
  );
}
