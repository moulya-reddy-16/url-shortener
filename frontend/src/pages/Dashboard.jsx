import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, HOST_URL, getShortUrlPrefix } from "../utils/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import QRCode from "qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Link2, Plus, Copy, Check, BarChart3, Trash2, Search, Filter,
  ExternalLink, Sparkles, BookOpen, Film, Plane, Briefcase, ShoppingBag, HelpCircle,
  QrCode, Calendar, Key, ArrowRight, Layers, SlidersHorizontal, Eye, EyeOff,
  Download, List, RotateCcw, ChevronDown
} from "lucide-react";
import Button from "../components/Button.jsx";
import GlassCard from "../components/GlassCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { CardSkeleton, RowSkeleton } from "../components/LoadingSkeleton.jsx";

const CATEGORIES = ["Study", "Entertainment", "Travel", "Work", "Shopping", "Other"];

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

export default function Dashboard() {
  const toast = useToast();
  const { networkIp } = useAuth();
  
  // Navigation tabs: 'create' | 'bulk' | 'links'
  const [activeTab, setActiveTab] = useState("create");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Single Link form state
  const [originalUrl, setOriginalUrl] = useState("");
  const [category, setCategory] = useState("Other");
  const [oneTime, setOneTime] = useState(false);
  const [customAlias, setCustomAlias] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [password, setPassword] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Bulk Link form state
  const [bulkInput, setBulkInput] = useState("");
  const [bulkCategory, setBulkCategory] = useState("Other");
  const [bulkLoading, setBulkLoading] = useState(false);

  // Global links data
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Sorting states
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All"); // 'All' | 'Active' | 'Inactive' | 'Expired'
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'oldest' | 'clicks-desc' | 'clicks-asc'

  // Clipboard copy feedback
  const [copiedId, setCopiedId] = useState(null);

  // QR Code Modal states
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [qrCodeTargetUrl, setQrCodeTargetUrl] = useState("");
  const [qrCodeTargetAlias, setQrCodeTargetAlias] = useState("");

  useEffect(() => {
    const fetchUrls = async (isSilent = false) => {
      try {
        const data = await api("/url/my-urls");
        setUrls(data.data || []);
      } catch {
        if (!isSilent) {
          toast.error("Failed to load your links.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUrls(false);

    // Background poll every 8 seconds
    const intervalId = setInterval(() => fetchUrls(true), 8000);
    return () => clearInterval(intervalId);
  }, [toast]);

  const handleShorten = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const data = await api("/url/create", {
        method: "POST",
        body: { 
          originalUrl, 
          category, 
          oneTime,
          customAlias: customAlias || undefined,
          expiresAt: expiresAt || undefined,
          password: password || undefined
        },
      });
      toast.success("Link shortened successfully!");
      setOriginalUrl("");
      setCategory("Other");
      setOneTime(false);
      setCustomAlias("");
      setExpiresAt("");
      setPassword("");
      setShowAdvanced(false);
      
      // Add to front of links list
      setUrls((prev) => [data.data, ...prev]);
      setActiveTab("links");
    } catch (err) {
      toast.error(err.message || "Failed to shorten URL");
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulkShorten = async (e) => {
    e.preventDefault();
    if (!bulkInput.trim()) return;

    const lines = bulkInput.split(/[\n,]+/).map(line => line.trim()).filter(Boolean);
    if (lines.length === 0) return;

    setBulkLoading(true);
    const linkObjects = lines.map(url => ({
      originalUrl: url,
      category: bulkCategory,
    }));

    try {
      const res = await api("/url/bulk-create", {
        method: "POST",
        body: { links: linkObjects },
      });

      if (res.data && res.data.length > 0) {
        setUrls((prev) => [...res.data, ...prev]);
        toast.success(`Successfully bulk-shortened ${res.data.length} links!`);
      }

      if (res.errors && res.errors.length > 0) {
        res.errors.forEach(err => {
          toast.error(`Error on URL #${err.index + 1}: ${err.message}`);
        });
      }

      setBulkInput("");
      setActiveTab("links");
    } catch (err) {
      toast.error(err.message || "Bulk shortening failed.");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    try {
      await api(`/url/${id}`, { method: "DELETE" });
      setUrls((prev) => prev.filter((url) => url._id !== id));
      toast.success("Link deleted successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to delete link");
    }
  };

  const toggleLinkStatus = async (id, currentStatus) => {
    try {
      const res = await api(`/url/${id}`, {
        method: "PATCH",
        body: { isActive: !currentStatus }
      });
      setUrls((prev) =>
        prev.map((url) => (url._id === id ? { ...url, isActive: res.data.isActive } : url))
      );
      toast.success(`Link marked as ${res.data.isActive ? "Active" : "Inactive"}`);
    } catch (err) {
      toast.error(err.message || "Failed to update link status");
    }
  };

  const handleCopy = (shortCode, id) => {
    const fullShortUrl = `${getShortUrlPrefix(networkIp)}${shortCode}`;
    navigator.clipboard.writeText(fullShortUrl);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenQrModal = (shortCode) => {
    const fullShortUrl = `${getShortUrlPrefix(networkIp)}${shortCode}`;
    QRCode.toDataURL(fullShortUrl, { width: 300, margin: 2 }, (err, dataUrl) => {
      if (err) {
        toast.error("Failed to generate QR Code");
        return;
      }
      setQrCodeDataUrl(dataUrl);
      setQrCodeTargetUrl(fullShortUrl);
      setQrCodeTargetAlias(shortCode);
      setShowQrModal(true);
    });
  };

  const downloadQr = () => {
    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    link.download = `qr-code-${qrCodeTargetAlias}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR code downloaded!");
  };

  // Metrics aggregations
  const totalClicks = urls.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const activeLinksCount = urls.filter(u => u.isActive && !(u.expiresAt && new Date(u.expiresAt) < new Date())).length;

  // Filter and Sort URLs
  const filteredAndSortedUrls = urls
    .filter((url) => {
      const matchesSearch = 
        url.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
        url.shortCode.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = filterCategory === "All" || url.category === filterCategory;
      
      const isExpired = (url.oneTime && url.used) || (url.expiresAt && new Date(url.expiresAt) < new Date());
      let matchesStatus = true;
      if (filterStatus === "Active") {
        matchesStatus = url.isActive && !isExpired;
      } else if (filterStatus === "Inactive") {
        matchesStatus = !url.isActive;
      } else if (filterStatus === "Expired") {
        matchesStatus = isExpired;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "clicks-desc") return b.clicks - a.clicks;
      if (sortBy === "clicks-asc") return a.clicks - b.clicks;
      return 0;
    });

  const subTabs = [
    { id: "create", label: "Shorten Link", icon: Plus },
    { id: "bulk", label: "Bulk Shortener", icon: Layers },
    { id: "links", label: "My Links cockpit", icon: List },
  ];

  return (
    <div className="space-y-8 w-full">
      {/* Header greetings */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col text-left">
          <h1 className="text-3xl font-black tracking-tight text-text-main">Links Cockpit</h1>
          <p className="text-sm text-text-muted mt-1">Shorten, protect, customize, and analyze link activity.</p>
        </div>
        
        <button
          onClick={async () => {
            setLoading(true);
            try {
              const data = await api("/url/my-urls");
              setUrls(data.data || []);
              toast.success("Cockpit metrics synchronized!");
            } catch {
              toast.error("Failed to refresh links.");
            } finally {
              setLoading(false);
            }
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-custom bg-bg-surface/30 backdrop-blur-xl text-text-muted hover:text-text-main hover:border-primary/30 transition-all cursor-pointer shadow-sm shrink-0"
          title="Sync Cockpit metrics"
        >
          <RotateCcw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} />
        </button>
      </div>

      {/* KPI Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {/* Total Links Card */}
            <GlassCard hoverGlow={false} className="flex items-center gap-4 py-5 bg-glass-bg/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                <Link2 className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Links</span>
                <span className="text-3xl font-black text-text-main leading-none mt-1 block">{urls.length}</span>
              </div>
            </GlassCard>

            {/* Total Clicks Card */}
            <GlassCard hoverGlow={false} className="flex items-center gap-4 py-5 bg-glass-bg/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary border border-secondary/20 shrink-0">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Clicks</span>
                <span className="text-3xl font-black text-text-main leading-none mt-1 block">{totalClicks}</span>
              </div>
            </GlassCard>

            {/* Active Links Card */}
            <GlassCard hoverGlow={false} className="flex items-center gap-4 py-5 bg-glass-bg/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent border border-accent/20 shrink-0">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Active Links</span>
                <span className="text-3xl font-black text-text-main leading-none mt-1 block">{activeLinksCount}</span>
              </div>
            </GlassCard>
          </>
        )}
      </div>

      {/* Vercel-style Tab Bar */}
      <div className="flex border-b border-border-custom overflow-x-auto gap-2 py-1 scrollbar-none shrink-0">
        {subTabs.map((tab) => {
          const IconComponent = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer rounded-lg shrink-0 ${
                active ? "text-primary" : "text-text-muted hover:text-text-main"
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span>{tab.label}</span>
              {active && (
                <motion.div
                  layoutId="activeSubTabIndicator"
                  className="absolute bottom-[-5px] left-0 right-0 h-0.5 bg-primary z-10"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <div className="w-full">
        {/* Tab 1: Single Link Form */}
        {activeTab === "create" && (
          <GlassCard hoverGlow={true} className="max-w-2xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-text-main mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Shorten a new URL
            </h2>
            
            <form onSubmit={handleShorten} className="space-y-5">
              {/* Destination URL Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Destination URL
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted/65">
                    <Link2 className="h-4 w-4" />
                  </span>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/very/long/campaign/parameter/names"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    className="block w-full rounded-xl border border-border-custom bg-bg-app/40 py-2.5 pl-10 pr-4 text-sm text-text-main placeholder-text-muted/40 outline-none focus:border-primary/50 focus:bg-bg-app transition-all"
                  />
                </div>
              </div>

              {/* Advanced Settings Collapsible Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-primary transition-all cursor-pointer py-1"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Advanced Configurations</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180 text-primary" : ""}`} />
              </button>

              {/* Advanced Configurations Section */}
              <AnimatePresence initial={false}>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden space-y-5 pt-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Custom Alias */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                          Custom Alias (Optional)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted/65 text-xs font-bold">
                            r/
                          </span>
                          <input
                            type="text"
                            placeholder="promo2026"
                            value={customAlias}
                            onChange={(e) => setCustomAlias(e.target.value)}
                            className="block w-full rounded-xl border border-border-custom bg-bg-app/40 py-2.5 pl-8 pr-4 text-sm text-text-main placeholder-text-muted/40 outline-none focus:border-primary/50 focus:bg-bg-app transition-all"
                          />
                        </div>
                      </div>

                      {/* Expiration date */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                          Expiration Date (Optional)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted/65">
                            <Calendar className="h-4 w-4" />
                          </span>
                          <input
                            type="date"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="block w-full rounded-xl border border-border-custom bg-bg-app/40 py-2.5 pl-10 pr-4 text-sm text-text-main outline-none focus:border-primary/50 focus:bg-bg-app transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {/* Category */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                          Category
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="block w-full rounded-xl border border-border-custom bg-bg-app/40 py-2.5 px-4 text-sm text-text-muted outline-none focus:border-primary/50 focus:bg-bg-app transition-all"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Password Protection */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                          Password (Optional)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted/65">
                            <Key className="h-4 w-4" />
                          </span>
                          <input
                            type="password"
                            placeholder="Secret123"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full rounded-xl border border-border-custom bg-bg-app/40 py-2.5 pl-10 pr-4 text-sm text-text-main placeholder-text-muted/40 outline-none focus:border-primary/50 focus:bg-bg-app transition-all"
                          />
                        </div>
                      </div>

                      {/* One Time Link */}
                      <div className="flex flex-col">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                          Link Lifespan
                        </label>
                        <button
                          type="button"
                          onClick={() => setOneTime(!oneTime)}
                          className={`flex items-center justify-between w-full rounded-xl border py-2.5 px-4 text-xs font-bold transition-all cursor-pointer ${
                            oneTime 
                              ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-455" 
                              : "border-border-custom bg-bg-app/40 text-text-muted hover:border-primary/20"
                          }`}
                        >
                          <span>One-Time Link</span>
                          <span className={`h-2 w-2 rounded-full ${oneTime ? "bg-rose-500 animate-pulse" : "bg-text-muted/40"}`}></span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit trigger */}
              <div className="pt-2 text-right">
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={formLoading}
                  loading={formLoading}
                  iconRight={ArrowRight}
                  className="w-full sm:w-auto px-8"
                >
                  Shorten URL
                </Button>
              </div>
            </form>
          </GlassCard>
        )}

        {/* Tab 2: Bulk Shortener */}
        {activeTab === "bulk" && (
          <GlassCard hoverGlow={true} className="max-w-2xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-text-main mb-1.5 flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Bulk URL Shortener
            </h2>
            <p className="text-xs text-text-muted mb-6">
              Enter multiple destination URLs (one per line, or separated by commas). Maximum 10 links.
            </p>

            <form onSubmit={handleBulkShorten} className="space-y-5">
              <div>
                <textarea
                  rows={5}
                  required
                  placeholder="https://google.com&#10;https://github.com&#10;https://linkedin.com"
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  className="block w-full rounded-xl border border-border-custom bg-bg-app/40 p-4 text-sm text-text-main placeholder-text-muted/40 outline-none focus:border-primary/50 focus:bg-bg-app transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                    Category Classification
                  </label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="block w-full rounded-xl border border-border-custom bg-bg-app/40 py-2.5 px-4 text-sm text-text-muted outline-none focus:border-primary/50 focus:bg-bg-app transition-all"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 text-right">
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={bulkLoading}
                  loading={bulkLoading}
                  iconRight={ArrowRight}
                  className="w-full sm:w-auto px-8"
                >
                  Bulk Shorten
                </Button>
              </div>
            </form>
          </GlassCard>
        )}

        {/* Tab 3: Cockpit links feed */}
        {activeTab === "links" && (
          <div className="space-y-6 w-full">
            {/* Toolbar controls */}
            <GlassCard hoverGlow={false} className="p-4 bg-glass-bg/30 flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted/60">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search links..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full rounded-xl border border-border-custom bg-bg-app/40 py-2 pl-10 pr-4 text-xs text-text-main outline-none focus:border-primary/50"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                {/* Category filter */}
                <div className="flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5 text-text-muted" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="rounded-xl border border-border-custom bg-bg-app/40 py-2 px-3 text-xs text-text-muted outline-none focus:border-primary/50"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-xl border border-border-custom bg-bg-app/40 py-2 px-3 text-xs text-text-muted outline-none focus:border-primary/50"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired</option>
                </select>

                {/* Sort select */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-border-custom bg-bg-app/40 py-2 px-3 text-xs text-text-muted outline-none focus:border-primary/50"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="clicks-desc">Clicks: High to Low</option>
                  <option value="clicks-asc">Clicks: Low to High</option>
                </select>
              </div>
            </GlassCard>

            {/* List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RowSkeleton />
                <RowSkeleton />
                <RowSkeleton />
                <RowSkeleton />
              </div>
            ) : filteredAndSortedUrls.length === 0 ? (
              <GlassCard hoverGlow={false} className="py-8 bg-glass-bg/10">
                <EmptyState 
                  title="No matching links" 
                  description="Adjust your search query or filters to locate your shortened links, or create a new one!" 
                  action={
                    <Button variant="outline" onClick={() => { setSearch(""); setFilterCategory("All"); setFilterStatus("All"); }} className="text-xs px-4">
                      Clear Filters
                    </Button>
                  }
                />
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredAndSortedUrls.map((url, index) => {
                    const CategoryIcon = CATEGORY_ICONS[url.category] || HelpCircle;
                    const isExpired = (url.oneTime && url.used) || (url.expiresAt && new Date(url.expiresAt) < new Date());
                    const showInactive = !url.isActive;
                    
                    return (
                      <GlassCard 
                        key={url._id}
                        delay={index * 0.03}
                        hoverGlow={true}
                        className={`flex flex-col justify-between h-full p-5 bg-glass-bg/30 ${
                          isExpired || showInactive ? "opacity-70" : ""
                        }`}
                      >
                        <div>
                          {/* Badges row */}
                          <div className="flex items-center justify-between mb-4">
                            <span className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full border ${CATEGORY_COLORS[url.category]}`}>
                              <CategoryIcon className="h-3 w-3" />
                              {url.category}
                            </span>
                            
                            <div className="flex items-center gap-1.5">
                              {url.passwordProtected && (
                                <span className="text-[9px] font-extrabold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded flex items-center gap-1">
                                  <Key className="h-2.5 w-2.5" />
                                  Locked
                                </span>
                              )}

                              {isExpired ? (
                                <span className="text-[9px] font-extrabold uppercase bg-rose-500/10 border border-rose-500/20 text-rose-500 px-2 py-0.5 rounded">
                                  Expired
                                </span>
                              ) : showInactive ? (
                                <span className="text-[9px] font-extrabold uppercase bg-slate-500/10 border border-slate-500/20 text-slate-500 px-2 py-0.5 rounded">
                                  Inactive
                                </span>
                              ) : (
                                <span className="text-[9px] font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">
                                  Active
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Short url row */}
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <a 
                              href={`${getShortUrlPrefix(networkIp)}${url.shortCode}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className={`text-base font-extrabold hover:text-primary transition-colors flex items-center gap-1.5 truncate ${
                                isExpired || showInactive ? "text-text-muted pointer-events-none" : "text-text-main"
                              }`}
                            >
                              {url.shortCode}
                              <ExternalLink className="h-3.5 w-3.5 opacity-65" />
                            </a>

                            <button
                              onClick={() => toggleLinkStatus(url._id, url.isActive)}
                              className="text-text-muted hover:text-primary p-1 rounded hover:bg-bg-surface/60 transition-all cursor-pointer"
                              title={url.isActive ? "Pause link redirection" : "Resume link redirection"}
                            >
                              {url.isActive ? <Eye className="h-4.5 w-4.5" /> : <EyeOff className="h-4.5 w-4.5 text-rose-400" />}
                            </button>
                          </div>

                          {/* Original URL Display */}
                          <p className="text-xs text-text-muted break-all line-clamp-1 mb-6" title={url.originalUrl}>
                            {url.originalUrl}
                          </p>
                        </div>

                        {/* Card footer: Click totals and Action Cluster */}
                        <div className="border-t border-border-custom pt-4 flex items-center justify-between mt-auto">
                          <div className="text-left">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">Clicks</span>
                            <span className="text-sm font-extrabold text-text-main leading-none mt-0.5 block">{url.clicks}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Copy trigger */}
                            <button
                              onClick={() => handleCopy(url.shortCode, url._id)}
                              disabled={isExpired || showInactive}
                              className="p-2 rounded-lg border border-border-custom bg-bg-app/40 text-text-muted hover:text-text-main hover:border-primary/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                              title="Copy Short URL"
                            >
                              {copiedId === url._id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>

                            {/* QR trigger */}
                            <button
                              onClick={() => handleOpenQrModal(url.shortCode)}
                              disabled={isExpired || showInactive}
                              className="p-2 rounded-lg border border-border-custom bg-bg-app/40 text-text-muted hover:text-text-main hover:border-primary/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                              title="Generate QR code"
                            >
                              <QrCode className="h-3.5 w-3.5" />
                            </button>

                            {/* Analytics Link */}
                            <Link
                              to={`/analytics/${url._id}`}
                              className="p-2 rounded-lg border border-border-custom bg-bg-app/40 text-text-muted hover:text-text-main hover:border-primary/25 transition-all"
                              title="Deep Metrics analytics"
                            >
                              <BarChart3 className="h-3.5 w-3.5" />
                            </Link>

                            {/* Delete trigger */}
                            <button
                              onClick={() => handleDelete(url._id)}
                              className="p-2 rounded-lg border border-border-custom bg-bg-app/40 text-text-muted hover:text-rose-500 hover:border-rose-500/25 transition-all cursor-pointer"
                              title="Delete shortcode"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Code Modal Dialog */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm rounded-3xl border border-border-custom bg-bg-surface p-6 shadow-2xl relative text-center"
            >
              <h3 className="text-base font-extrabold text-text-main mb-1">QR Code Generated</h3>
              <p className="text-xs text-text-muted break-all mb-6">{qrCodeTargetUrl}</p>

              <div className="mx-auto border border-border-custom p-4 rounded-2xl bg-white w-fit mb-6 shadow-inner">
                <img src={qrCodeDataUrl} alt="Short URL QR Code" className="h-44 w-44 object-contain" />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="glass"
                  onClick={() => setShowQrModal(false)}
                  className="flex-1 py-3 text-xs"
                >
                  Close
                </Button>
                <Button
                  variant="gradient"
                  onClick={downloadQr}
                  icon={Download}
                  className="flex-1 py-3 text-xs"
                >
                  Download PNG
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
