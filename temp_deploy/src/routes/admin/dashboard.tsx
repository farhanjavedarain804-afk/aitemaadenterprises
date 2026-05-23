import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LogOut, Inbox, Search, Mail, Phone, Building2, MessageSquare,
  Calendar, Trash2, CheckCircle2, Circle, Loader2,
  TrendingUp, Users, PieChart as PieChartIcon, Settings,
  Clock, Shield, ShieldOff, Timer, TimerOff, StickyNote,
  Hash, RefreshCw, X, Save, ChevronDown, ChevronUp, Bell,
  BarChart2, Globe, Laptop, Smartphone, MapPin, Monitor, Clock as ClockIcon, ListTodo, Key, Mail as MailIcon, UserPlus
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import logo from "@/assets/logo.png";
import { getSettings, saveSettings, type SiteSettings } from "@/lib/settings";
import { logAdminAction } from "@/lib/adminLogger";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Aitemaad Enterprises" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardPage,
});

type Inquiry = {
  id: string;
  full_name: string;
  company_name: string | null;
  phone: string;
  email: string;
  service: string;
  message: string;
  status: string;
  created_at: string;
};

// ── Live clock ─────────────────────────────────────────────────────────────
function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// ── Note storage (keyed by inquiry id) ─────────────────────────────────────
const NOTES_KEY = "ae_inquiry_notes";
function getNotes(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) ?? "{}"); } catch { return {}; }
}
function saveNote(id: string, note: string) {
  const notes = getNotes();
  notes[id] = note;
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

// ── Formatted Inquiry ID ──────────────────────────────────────────────────────
function formatInquiryId(index: number, createdAt: string) {
  const year = new Date(createdAt).getFullYear();
  const num = String(index).padStart(3, "0");
  return `INQ-${num}-AE/${year}`;
}

// ── Date-time bar ───────────────────────────────────────────────────────────
function DateTimeBar() {
  const now = useLiveClock();
  return (
    <div className="bg-primary text-primary-foreground text-xs flex items-center justify-between px-4 sm:px-6 lg:px-8 py-1.5 font-medium">
      <div className="flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 opacity-80" />
        <span>
          {now.toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </span>
        <span className="opacity-60">|</span>
        <span className="tabular-nums font-mono text-sm">
          {now.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-2 opacity-70">
        <Bell className="h-3 w-3" />
        <span>Aitemaad Enterprises — Admin Control Panel</span>
      </div>
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === "new") return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
      <Circle className="h-2 w-2 fill-primary" /> New
    </span>
  );
  if (status === "read") return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-accent bg-accent/15 px-2.5 py-1 rounded-full">
      <CheckCircle2 className="h-3 w-3" /> Read
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
      <Trash2 className="h-3 w-3" /> Archived
    </span>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
function DashboardPage() {
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsRow[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "new" | "read" | "archived">("all");
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "traffic" | "inquiries" | "activity" | "settings">("overview");

  // Auth states
  const [authForm, setAuthForm] = useState({ password: "", newEmail: "", newAdminEmail: "", newAdminPassword: "" });
  const [authLoading, setAuthLoading] = useState<"password" | "email" | "newadmin" | null>(null);

  // Note state
  const [notes, setNotes] = useState<Record<string, string>>(getNotes);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const noteRef = useRef<HTMLTextAreaElement>(null);

  // Status update dialog
  const [statusDialog, setStatusDialog] = useState<{ id: string; name: string; newStatus: string } | null>(null);
  const [statusNote, setStatusNote] = useState("");

  // Site settings
  const [settings, setSettings] = useState<SiteSettings>(getSettings);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [localSettings, setLocalSettings] = useState<SiteSettings>(getSettings);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/admin/login" }); return; }
      setUserEmail(session.user.email ?? "");
      setAuthChecking(false);
      void load();
    };
    void init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/admin/login" });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const load = async () => {
    setLoading(true);
    const [inqRes, anRes, logsRes] = await Promise.all([
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("analytics").select("*").order("last_active_at", { ascending: false }).limit(1000),
      supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(100)
    ]);
    if (inqRes.error) toast.error("Failed to load inquiries: " + inqRes.error.message);
    else setInquiries(inqRes.data as Inquiry[]);
    
    if (!anRes.error) {
      setAnalytics(anRes.data as AnalyticsRow[]);
    }
    if (!logsRes.error) {
      setAdminLogs(logsRes.data as AdminLog[]);
    }
    setLoading(false);
  };

  const filtered = useMemo(() => inquiries.filter((i) => {
    if (filter !== "all" && i.status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return i.full_name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) ||
      i.phone.toLowerCase().includes(q) || i.service.toLowerCase().includes(q) ||
      (i.company_name?.toLowerCase().includes(q) ?? false) ||
      shortId(i.id).toLowerCase().includes(q);
  }), [inquiries, search, filter]);

  const stats = useMemo(() => ({
    total: inquiries.length,
    new: inquiries.filter(i => i.status === "new").length,
    read: inquiries.filter(i => i.status === "read").length,
    archived: inquiries.filter(i => i.status === "archived").length,
  }), [inquiries]);

  const timeTrends = useMemo(() => {
    const groups: Record<string, number> = {};
    [...inquiries].reverse().forEach(i => {
      const d = new Date(i.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      groups[d] = (groups[d] || 0) + 1;
    });
    return Object.entries(groups).map(([date, count]) => ({ date, count }));
  }, [inquiries]);

  const serviceData = useMemo(() => {
    const groups: Record<string, number> = {};
    inquiries.forEach(i => { const s = i.service || "Other"; groups[s] = (groups[s] || 0) + 1; });
    return Object.entries(groups).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [inquiries]);

  // Build a stable map: inquiry uuid → formatted ID (ordered by created_at asc)
  const inquiryIdMap = useMemo(() => {
    const sorted = [...inquiries].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const map: Record<string, string> = {};
    sorted.forEach((inq, i) => {
      map[inq.id] = formatInquiryId(i + 1, inq.created_at);
    });
    return map;
  }, [inquiries]);

  const statusData = useMemo(() => [
    { name: "New", value: stats.new, color: "#16a34a" },
    { name: "Read", value: stats.read, color: "#f59e0b" },
    { name: "Archived", value: stats.archived, color: "#64748b" }
  ].filter(s => s.value > 0), [stats]);

  // Traffic Stats
  const trafficStats = useMemo(() => {
    const now = new Date().getTime();
    let activeNow = 0;
    let totalStayTime = 0;
    let desktop = 0;
    let mobile = 0;
    let tablet = 0;
    
    analytics.forEach(a => {
      // Active in last 2 minutes
      if (now - new Date(a.last_active_at).getTime() < 120000) activeNow++;
      totalStayTime += a.stay_time_seconds || 0;
      
      const dev = a.device?.toLowerCase() || "";
      if (dev.includes("mobile")) mobile++;
      else if (dev.includes("tablet")) tablet++;
      else desktop++;
    });

    const avgStaySeconds = analytics.length > 0 ? Math.floor(totalStayTime / analytics.length) : 0;
    const m = Math.floor(avgStaySeconds / 60);
    const s = avgStaySeconds % 60;
    const avgStay = m > 0 ? `${m}m ${s}s` : `${s}s`;

    return { activeNow, total: analytics.length, avgStay, desktop, mobile, tablet };
  }, [analytics]);

  // ─ Handlers ──────────────────────────────────────────────────────────────
  const confirmStatusUpdate = async () => {
    if (!statusDialog) return;
    const { id, newStatus } = statusDialog;
    const { error } = await supabase.from("inquiries").update({ status: newStatus }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    
    logAdminAction(userEmail, "UPDATE_STATUS", `Updated status of inquiry ${inquiryIdMap[id] || id} to ${newStatus}`);
    
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    if (selected?.id === id) setSelected(s => s ? { ...s, status: newStatus } : s);
    if (statusNote.trim()) {
      const note = `[${new Date().toLocaleString()}] Status → ${newStatus}: ${statusNote.trim()}`;
      const existing = notes[id] ? notes[id] + "\n" + note : note;
      setNotes(prev => ({ ...prev, [id]: existing }));
      saveNote(id, existing);
    }
    setStatusDialog(null);
    setStatusNote("");
    toast.success(`Status updated to "${newStatus}"`);
  };

  const promptStatusChange = (i: Inquiry, newStatus: string) => {
    setStatusDialog({ id: i.id, name: i.full_name, newStatus });
    setStatusNote("");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this inquiry permanently?")) return;
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) return toast.error(error.message);
    
    logAdminAction(userEmail, "DELETE_INQUIRY", `Deleted inquiry ${inquiryIdMap[id] || id}`);
    
    setInquiries(prev => prev.filter(i => i.id !== id));
    if (selected?.id === id) setSelected(null);
    toast.success("Inquiry deleted");
  };

  const signOut = async () => { 
    await logAdminAction(userEmail, "LOGOUT", "Admin signed out");
    await supabase.auth.signOut(); 
    navigate({ to: "/admin/login" }); 
  };

  const openDetail = (i: Inquiry) => {
    setSelected(i);
    if (i.status === "new") promptStatusChange(i, "read");
  };

  const saveNoteForInquiry = (id: string, text: string) => {
    setNotes(prev => ({ ...prev, [id]: text }));
    saveNote(id, text);
    setEditingNote(null);
    toast.success("Note saved");
  };

  const applySettings = () => {
    const saved = saveSettings(localSettings);
    logAdminAction(userEmail, "UPDATE_SETTINGS", "Updated site settings (maintenance mode / countdown)");
    setSettings(saved);
    setSettingsDirty(false);
    toast.success("Settings saved & applied to site!");
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading("password");
    try {
      const { error } = await supabase.auth.updateUser({ password: authForm.password });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setAuthForm(f => ({ ...f, password: "" }));
      logAdminAction(userEmail, "UPDATE_SETTINGS", "Changed admin password");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAuthLoading(null);
    }
  };

  const changeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading("email");
    try {
      const { error } = await supabase.auth.updateUser({ email: authForm.newEmail });
      if (error) throw error;
      toast.success("Email update link sent! Please check both your old and new inboxes.");
      setAuthForm(f => ({ ...f, newEmail: "" }));
      logAdminAction(userEmail, "UPDATE_SETTINGS", "Requested email address change");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAuthLoading(null);
    }
  };

  const createNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading("newadmin");
    try {
      const { error } = await supabase.auth.signUp({
        email: authForm.newAdminEmail,
        password: authForm.newAdminPassword,
      });
      if (error) throw error;
      toast.success("New admin created! You have been signed in as the new user.");
      logAdminAction(authForm.newAdminEmail, "LOGIN", "New admin account created by existing admin");
      setAuthForm(f => ({ ...f, newAdminEmail: "", newAdminPassword: "" }));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAuthLoading(null);
    }
  };

  const updateLocalSetting = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setSettingsDirty(true);
  };

  if (authChecking) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Date-Time Bar */}
      <DateTimeBar />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src={logo} alt="Aitemaad Enterprises logo" className="h-10 w-10 object-contain" />
          </Link>

          {/* Tabs */}
          <nav className="flex items-center gap-1 bg-muted rounded-xl p-1">
            {([
              { key: "overview", label: "Overview", icon: <BarChart2 className="h-3.5 w-3.5" /> },
              { key: "traffic", label: "Traffic", icon: <Globe className="h-3.5 w-3.5" /> },
              { key: "inquiries", label: "Inquiries", icon: <Inbox className="h-3.5 w-3.5" /> },
              { key: "activity", label: "Activity", icon: <ListTodo className="h-3.5 w-3.5" /> },
              { key: "settings", label: "Settings", icon: <Settings className="h-3.5 w-3.5" /> },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {tab.icon} {tab.label}
                {tab.key === "inquiries" && stats.new > 0 && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5">{stats.new}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {settings.maintenanceMode && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-100 px-2.5 py-1.5 rounded-full border border-orange-200">
                <ShieldOff className="h-3 w-3" /> Maintenance ON
              </span>
            )}
            <span className="hidden sm:inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <Users className="h-3 w-3" /> {userEmail}
            </span>
            <button
              onClick={load}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground bg-card border border-border hover:bg-muted rounded-lg px-4 py-2 transition-all shadow-sm"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Analytics Overview</h1>
              <p className="text-sm text-muted-foreground mt-1">Real-time insights from your website inquiries</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Inquiries", value: stats.total, bg: "bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/20", iconBg: "bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30", icon: <Inbox className="h-5 w-5" /> },
                { label: "New / Unread", value: stats.new, bg: "bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20", iconBg: "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/30", icon: <MessageSquare className="h-5 w-5" /> },
                { label: "Read / Active", value: stats.read, bg: "bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20", iconBg: "bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-lg shadow-amber-500/30", icon: <TrendingUp className="h-5 w-5" /> },
                { label: "Archived", value: stats.archived, bg: "bg-gradient-to-br from-slate-500/10 to-gray-500/5 border-slate-500/20", iconBg: "bg-gradient-to-tr from-slate-600 to-gray-500 text-white shadow-lg shadow-slate-500/30", icon: <CheckCircle2 className="h-5 w-5" /> },
              ].map(s => (
                <div key={s.label} className={`group relative rounded-2xl border ${s.bg} p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
                  {/* Subtle glass reflection effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay" />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{s.label}</div>
                      <div className="text-4xl font-black text-foreground tracking-tight tabular-nums drop-shadow-sm">
                        {s.value}
                      </div>
                    </div>
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${s.iconBg}`}>
                      {s.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            {inquiries.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm lg:col-span-2">
                  <h3 className="font-bold text-foreground flex items-center gap-2 mb-6">
                    <TrendingUp className="h-5 w-5 text-primary" /> Inquiry Trends Over Time
                  </h3>
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeTrends} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px" }} />
                        <Line type="monotone" dataKey="count" name="Inquiries" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: "#16a34a" }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                  <h3 className="font-bold text-foreground flex items-center gap-2 mb-4">
                    <PieChartIcon className="h-5 w-5 text-amber-500" /> Status Breakdown
                  </h3>
                  <div className="h-[260px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                          {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    {statusData.map(s => (
                      <div key={s.name} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full inline-block" style={{ background: s.color }} />{s.name}</span>
                        <span className="font-bold text-foreground">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm lg:col-span-3">
                  <h3 className="font-bold text-foreground flex items-center gap-2 mb-6">
                    <Building2 className="h-5 w-5 text-blue-500" /> Top Services Requested
                  </h3>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={serviceData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={110} />
                        <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                        <Bar dataKey="value" name="Requests" fill="#16a34a" radius={[0, 6, 6, 0]} barSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Funnel / Flow */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm lg:col-span-3">
                  <h3 className="font-bold text-foreground flex items-center gap-2 mb-6">
                    <TrendingUp className="h-5 w-5 text-primary" /> Inquiry Lifecycle Flow
                  </h3>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    {[
                      { label: "Received", value: stats.total, color: "bg-blue-500" },
                      { label: "Read", value: stats.read + stats.archived, color: "bg-amber-500" },
                      { label: "Archived / Done", value: stats.archived, color: "bg-primary" },
                    ].map((step, i, arr) => (
                      <div key={step.label} className="flex items-center gap-3">
                        <div className="text-center">
                          <div className={`h-16 w-16 ${step.color} text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm mx-auto`}>
                            {step.value}
                          </div>
                          <div className="mt-2 text-xs font-semibold text-muted-foreground">{step.label}</div>
                        </div>
                        {i < arr.length - 1 && <div className="text-2xl text-muted-foreground font-light">→</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── TRAFFIC TAB ──────────────────────────────────────────────── */}
        {activeTab === "traffic" && (
          <>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Traffic & Analytics</h1>
              <p className="text-sm text-muted-foreground mt-1">Real-time visitor tracking and metrics</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Active Now", value: trafficStats.activeNow, bg: "bg-emerald-500/10 border-emerald-500/20", iconBg: "bg-emerald-500 text-white shadow-emerald-500/30", icon: <ClockIcon className="h-5 w-5 animate-pulse" /> },
                { label: "Total Sessions", value: trafficStats.total, bg: "bg-blue-500/10 border-blue-500/20", iconBg: "bg-blue-500 text-white shadow-blue-500/30", icon: <Globe className="h-5 w-5" /> },
                { label: "Avg Stay Time", value: trafficStats.avgStay, bg: "bg-amber-500/10 border-amber-500/20", iconBg: "bg-amber-500 text-white shadow-amber-500/30", icon: <Timer className="h-5 w-5" /> },
                { label: "Desktop Users", value: trafficStats.desktop, bg: "bg-slate-500/10 border-slate-500/20", iconBg: "bg-slate-500 text-white shadow-slate-500/30", icon: <Monitor className="h-5 w-5" /> },
              ].map(s => (
                <div key={s.label} className={`group relative rounded-2xl border ${s.bg} p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{s.label}</div>
                      <div className="text-4xl font-black text-foreground tracking-tight tabular-nums drop-shadow-sm">{s.value}</div>
                    </div>
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${s.iconBg}`}>
                      {s.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Devices Chart */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="font-bold text-foreground flex items-center gap-2 mb-4">
                  <Smartphone className="h-5 w-5 text-indigo-500" /> Devices
                </h3>
                <div className="h-[260px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Desktop", value: trafficStats.desktop, color: "#3b82f6" },
                          { name: "Mobile", value: trafficStats.mobile, color: "#8b5cf6" },
                          { name: "Tablet", value: trafficStats.tablet, color: "#f59e0b" },
                        ].filter(d => d.value > 0)}
                        innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none"
                      >
                        {[{color:"#3b82f6"}, {color:"#8b5cf6"}, {color:"#f59e0b"}].map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-2 text-sm font-medium">
                  <span className="flex items-center gap-2"><div className="h-3 w-3 bg-blue-500 rounded-full"/> Desktop ({trafficStats.desktop})</span>
                  <span className="flex items-center gap-2"><div className="h-3 w-3 bg-purple-500 rounded-full"/> Mobile ({trafficStats.mobile})</span>
                  <span className="flex items-center gap-2"><div className="h-3 w-3 bg-amber-500 rounded-full"/> Tablet ({trafficStats.tablet})</span>
                </div>
              </div>

              {/* Recent Sessions Table */}
              <div className="bg-card rounded-2xl border border-border p-0 shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-border">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-500" /> Recent Visitors
                  </h3>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Location</th>
                        <th className="px-6 py-4 font-semibold">IP Address</th>
                        <th className="px-6 py-4 font-semibold">Device</th>
                        <th className="px-6 py-4 font-semibold">Stay Time</th>
                        <th className="px-6 py-4 font-semibold">Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {analytics.slice(0, 15).map(a => {
                        const m = Math.floor((a.stay_time_seconds || 0) / 60);
                        const s = (a.stay_time_seconds || 0) % 60;
                        const isActive = (new Date().getTime() - new Date(a.last_active_at).getTime()) < 120000;
                        return (
                          <tr key={a.id} className="hover:bg-muted/40 transition-colors">
                            <td className="px-6 py-4 font-medium">{a.location}</td>
                            <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{a.ip_address}</td>
                            <td className="px-6 py-4 text-muted-foreground">{a.device}</td>
                            <td className="px-6 py-4 font-mono text-xs">{m > 0 ? `${m}m ${s}s` : `${s}s`}</td>
                            <td className="px-6 py-4">
                              {isActive ? (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full"><span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"/> Now</span>
                              ) : (
                                <span className="text-muted-foreground text-[10px] uppercase font-semibold">Past</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── INQUIRIES TAB ────────────────────────────────────────────── */}
        {activeTab === "inquiries" && (
          <>
            <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Inquiry Database</h2>
                <p className="text-sm text-muted-foreground mt-1">{inquiries.length} total records</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, ID, service…"
                    className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>
                <div className="flex gap-1 bg-card rounded-xl border border-border p-1 shadow-sm shrink-0">
                  {(["all", "new", "read", "archived"] as const).map(f => (
                    <button
                      key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition whitespace-nowrap ${filter === f ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                    >
                      {f} {f === "new" && stats.new > 0 && <span className="ml-1 bg-white/30 text-inherit px-1 rounded-full text-[10px]">{stats.new}</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              {loading ? (
                <div className="p-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : filtered.length === 0 ? (
                <div className="p-20 text-center text-muted-foreground">
                  <Inbox className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-semibold text-foreground">No records found</h3>
                  <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-muted/50 text-muted-foreground border-b border-border font-semibold text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">ID</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Contact</th>
                        <th className="px-5 py-3.5">Company</th>
                        <th className="px-5 py-3.5">Service</th>
                        <th className="px-5 py-3.5">Notes</th>
                        <th className="px-5 py-3.5">Received</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map(i => (
                        <tr key={i.id} className="hover:bg-muted/40 cursor-pointer transition-colors group">
                          <td className="px-5 py-4" onClick={() => openDetail(i)}>
                            <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg whitespace-nowrap">
                              <Hash className="h-3 w-3" />{inquiryIdMap[i.id] ?? "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4" onClick={() => openDetail(i)}>
                            <StatusBadge status={i.status} />
                          </td>
                          <td className="px-5 py-4" onClick={() => openDetail(i)}>
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{i.full_name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{i.email}</div>
                          </td>
                          <td className="px-5 py-4" onClick={() => openDetail(i)}>
                            {i.company_name || <span className="text-muted-foreground/40">—</span>}
                          </td>
                          <td className="px-5 py-4 font-medium" onClick={() => openDetail(i)}>{i.service}</td>
                          <td className="px-5 py-4">
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingNote(i.id); setNoteText(notes[i.id] ?? ""); }}
                              className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-all border ${notes[i.id] ? "text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100" : "text-muted-foreground border-border hover:border-primary hover:text-primary hover:bg-primary/5"}`}
                              title={notes[i.id] || "Add note"}
                            >
                              <StickyNote className="h-3.5 w-3.5" />
                              {notes[i.id] ? "View" : "Add"}
                            </button>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground text-xs" onClick={() => openDetail(i)}>
                            <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(i.created_at).toLocaleDateString()}</div>
                            <div className="text-[10px] mt-0.5 opacity-60">{new Date(i.created_at).toLocaleTimeString()}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
        {/* ── ACTIVITY LOGS TAB ────────────────────────────────────────── */}
        {activeTab === "activity" && (
          <>
            <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Admin Activity Logs</h2>
                <p className="text-sm text-muted-foreground mt-1">Audit trail of all administrative actions</p>
              </div>
            </div>

            <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-elegant">
              {adminLogs.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center">
                  <ListTodo className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No activity logs recorded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Timestamp</th>
                        <th className="px-6 py-4 font-semibold">Admin</th>
                        <th className="px-6 py-4 font-semibold">Action</th>
                        <th className="px-6 py-4 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {adminLogs.map(log => (
                        <tr key={log.id} className="hover:bg-muted/40 transition-colors group">
                          <td className="px-6 py-4 text-xs whitespace-nowrap">
                            <div className="font-medium text-foreground">{new Date(log.created_at).toLocaleDateString()}</div>
                            <div className="text-muted-foreground mt-0.5">{new Date(log.created_at).toLocaleTimeString()}</div>
                          </td>
                          <td className="px-6 py-4 font-medium text-foreground">{log.admin_email}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
                              {log.action_type.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{log.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}


        {/* ── SETTINGS TAB ─────────────────────────────────────────────── */}
        {activeTab === "settings" && (
          <>
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Site Settings</h2>
              <p className="text-sm text-muted-foreground mt-1">Control site-wide features and configurations</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Maintenance Mode */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${localSettings.maintenanceMode ? "bg-orange-100 text-orange-600" : "bg-muted text-muted-foreground"}`}>
                      {localSettings.maintenanceMode ? <ShieldOff className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Maintenance Mode</div>
                      <div className="text-sm text-muted-foreground mt-0.5">Show a maintenance banner on the site</div>
                    </div>
                  </div>
                  <button
                    onClick={() => updateLocalSetting("maintenanceMode", !localSettings.maintenanceMode)}
                    className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${localSettings.maintenanceMode ? "bg-orange-500" : "bg-muted-foreground/30"}`}
                    style={{ width: "52px" }}
                  >
                    <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${localSettings.maintenanceMode ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>
                {localSettings.maintenanceMode && (
                  <div className="mt-4">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Maintenance Message</label>
                    <textarea
                      rows={3}
                      value={localSettings.maintenanceMessage}
                      onChange={e => updateLocalSetting("maintenanceMessage", e.target.value)}
                      className="w-full mt-2 rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                )}
                {localSettings.maintenanceMode && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
                    <ShieldOff className="h-3.5 w-3.5 shrink-0" />
                    Site is currently in maintenance mode. Save to apply.
                  </div>
                )}
              </div>

              {/* Countdown */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${localSettings.countdownEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {localSettings.countdownEnabled ? <Timer className="h-5 w-5" /> : <TimerOff className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Countdown Timer</div>
                      <div className="text-sm text-muted-foreground mt-0.5">Show/hide the countdown on homepage</div>
                    </div>
                  </div>
                  <button
                    onClick={() => updateLocalSetting("countdownEnabled", !localSettings.countdownEnabled)}
                    className={`relative inline-flex h-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${localSettings.countdownEnabled ? "bg-primary" : "bg-muted-foreground/30"}`}
                    style={{ width: "52px" }}
                  >
                    <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${localSettings.countdownEnabled ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>

                {localSettings.countdownEnabled && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Countdown Label</label>
                      <input
                        type="text"
                        value={localSettings.countdownLabel}
                        onChange={e => updateLocalSetting("countdownLabel", e.target.value)}
                        className="w-full mt-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. Official Launch In"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Date & Time</label>
                      <input
                        type="datetime-local"
                        value={localSettings.countdownDate.slice(0, 16)}
                        onChange={e => updateLocalSetting("countdownDate", new Date(e.target.value).toISOString())}
                        className="w-full mt-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="text-xs text-primary bg-primary/5 border border-primary/20 rounded-xl px-3 py-2">
                      Countdown target: <strong>{new Date(localSettings.countdownDate).toLocaleString()}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECURITY & ACCESS SECTION */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-foreground tracking-tight mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-500" /> Security & Access
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Change Credentials */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
                  
                  <form onSubmit={changePassword}>
                    <h4 className="font-bold text-foreground flex items-center gap-2 mb-2"><Key className="h-4 w-4" /> Change Password</h4>
                    <p className="text-xs text-muted-foreground mb-3">Update your current admin password.</p>
                    <div className="flex gap-2">
                      <input 
                        type="password" required minLength={6} placeholder="New Password"
                        value={authForm.password} onChange={e => setAuthForm(f => ({...f, password: e.target.value}))}
                        className="flex-1 rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button type="submit" disabled={authLoading === "password"} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50">
                        {authLoading === "password" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                      </button>
                    </div>
                  </form>

                  <div className="h-px bg-border w-full" />

                  <form onSubmit={changeEmail}>
                    <h4 className="font-bold text-foreground flex items-center gap-2 mb-2"><MailIcon className="h-4 w-4" /> Change Email</h4>
                    <p className="text-xs text-muted-foreground mb-3">A confirmation link will be sent to both emails.</p>
                    <div className="flex gap-2">
                      <input 
                        type="email" required placeholder="new@admin.com"
                        value={authForm.newEmail} onChange={e => setAuthForm(f => ({...f, newEmail: e.target.value}))}
                        className="flex-1 rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button type="submit" disabled={authLoading === "email"} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50">
                        {authLoading === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Add New Admin */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                  <form onSubmit={createNewAdmin}>
                    <h4 className="font-bold text-foreground flex items-center gap-2 mb-2"><UserPlus className="h-4 w-4" /> Add New Admin User</h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      Create a new team member. <strong>Warning:</strong> Creating a new user will automatically sign you out of your current session.
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
                        <input 
                          type="email" required placeholder="team@admin.com"
                          value={authForm.newAdminEmail} onChange={e => setAuthForm(f => ({...f, newAdminEmail: e.target.value}))}
                          className="w-full mt-1 rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Password</label>
                        <input 
                          type="password" required minLength={6} placeholder="••••••••"
                          value={authForm.newAdminPassword} onChange={e => setAuthForm(f => ({...f, newAdminPassword: e.target.value}))}
                          className="w-full mt-1 rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <button type="submit" disabled={authLoading === "newadmin"} className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 mt-2 flex justify-center items-center gap-2">
                        {authLoading === "newadmin" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4" /> Create User</>}
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>

            {settingsDirty && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background rounded-2xl px-6 py-4 flex items-center gap-4 shadow-2xl border border-border/20">
                <span className="text-sm font-medium">You have unsaved changes</span>
                <button
                  onClick={applySettings}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition"
                >
                  <Save className="h-4 w-4" /> Save & Apply
                </button>
                <button
                  onClick={() => { setLocalSettings(settings); setSettingsDirty(false); }}
                  className="text-muted-foreground hover:text-background transition text-sm"
                >
                  Discard
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Note Editor Modal ─────────────────────────────────────────────── */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4" onClick={() => setEditingNote(null)}>
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground flex items-center gap-2"><StickyNote className="h-5 w-5 text-amber-500" /> Inquiry Note</h3>
              <button onClick={() => setEditingNote(null)} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-foreground hover:text-background transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <textarea
              ref={noteRef}
              rows={5}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Add your note here… (e.g. follow-up scheduled, client responded, etc.)"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => saveNoteForInquiry(editingNote, noteText)} className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-2.5 font-semibold text-sm hover:opacity-90 transition">
                <Save className="h-4 w-4" /> Save Note
              </button>
              {notes[editingNote] && (
                <button onClick={() => saveNoteForInquiry(editingNote, "")} className="px-4 text-destructive hover:bg-destructive/10 rounded-xl transition text-sm">Clear</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Status Update Dialog ──────────────────────────────────────────── */}
      {statusDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4" onClick={() => setStatusDialog(null)}>
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Update Status</h3>
              <button onClick={() => setStatusDialog(null)} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-foreground hover:text-background transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Changing status of <strong className="text-foreground">{statusDialog.name}</strong> to{" "}
              <StatusBadge status={statusDialog.newStatus} />
            </p>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add a note (optional)</label>
            <textarea
              rows={3}
              value={statusNote}
              onChange={e => setStatusNote(e.target.value)}
              autoFocus
              className="w-full mt-2 rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="e.g. Called client, sent quote, scheduled visit…"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={confirmStatusUpdate} className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-2.5 font-semibold text-sm hover:opacity-90 transition">
                <CheckCircle2 className="h-4 w-4" /> Confirm Update
              </button>
              <button onClick={() => setStatusDialog(null)} className="px-5 text-muted-foreground hover:text-foreground rounded-xl transition text-sm border border-border hover:bg-muted">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Inquiry Detail Drawer ─────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelected(null)}>
          <div className="flex-1 bg-background/60 backdrop-blur-sm" />
          <div className="w-full max-w-lg bg-card h-full overflow-y-auto shadow-2xl border-l border-border" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-md p-6 border-b border-border flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-mono text-xs bg-muted text-muted-foreground px-2 py-1 rounded-lg flex items-center gap-1"><Hash className="h-3 w-3" />{inquiryIdMap[selected.id] ?? "—"}</span>
                  <StatusBadge status={selected.status} />
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(selected.created_at).toLocaleString()}</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{selected.full_name}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-foreground hover:text-background transition-colors"><X className="h-4 w-4" /></button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-muted/30 rounded-2xl p-5 border border-border/50 space-y-4">
                <DetailRow icon={<Mail className="h-4 w-4" />} label="Email">
                  <a href={`mailto:${selected.email}`} className="text-primary font-medium hover:underline">{selected.email}</a>
                </DetailRow>
                <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone">
                  <a href={`tel:${selected.phone}`} className="text-primary font-medium hover:underline">{selected.phone}</a>
                </DetailRow>
                {selected.company_name && (
                  <DetailRow icon={<Building2 className="h-4 w-4" />} label="Company">
                    <span className="font-medium text-foreground">{selected.company_name}</span>
                  </DetailRow>
                )}
              </div>

              <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20">
                <DetailRow icon={<CheckCircle2 className="h-4 w-4 text-primary" />} label="Service Required">
                  <span className="text-lg font-bold text-foreground">{selected.service}</span>
                </DetailRow>
              </div>

              <DetailRow icon={<MessageSquare className="h-4 w-4" />} label="Message">
                <div className="bg-muted/30 rounded-xl p-4 mt-2 text-foreground/90 whitespace-pre-wrap leading-relaxed border border-border/50">
                  {selected.message}
                </div>
              </DetailRow>

              {/* Note in drawer */}
              <DetailRow icon={<StickyNote className="h-4 w-4 text-amber-500" />} label="Admin Note">
                {notes[selected.id] ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-2 text-amber-900 whitespace-pre-wrap text-sm leading-relaxed">
                    {notes[selected.id]}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm mt-1">No note added yet.</div>
                )}
                <button
                  onClick={() => { setEditingNote(selected.id); setNoteText(notes[selected.id] ?? ""); }}
                  className="mt-2 text-xs font-semibold text-amber-600 hover:text-amber-800 transition underline underline-offset-2"
                >
                  {notes[selected.id] ? "Edit note" : "Add note"}
                </button>
              </DetailRow>
            </div>

            <div className="p-6 border-t border-border space-y-3 bg-muted/10">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Change Status</div>
              <div className="flex gap-2 flex-wrap">
                {(["new", "read", "archived"] as const).filter(s => s !== selected.status).map(s => (
                  <button
                    key={s}
                    onClick={() => promptStatusChange(selected, s)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold border border-border bg-card hover:bg-muted transition capitalize"
                  >
                    Mark as {s}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <a
                  href={`https://wa.me/${selected.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(`Hello ${selected.full_name}, regarding your inquiry about ${selected.service}…`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-sm font-bold bg-[#25D366] text-white rounded-xl py-3 hover:bg-[#20bd5a] transition-colors shadow-sm"
                >
                  <MessageSquare className="h-4 w-4" /> WhatsApp
                </a>
                <a
                  href={`mailto:${selected.email}?subject=Re: Your Inquiry about ${selected.service}`}
                  className="inline-flex items-center justify-center gap-2 text-sm font-bold bg-card border border-border text-foreground rounded-xl py-3 hover:bg-muted transition-colors shadow-sm"
                >
                  <Mail className="h-4 w-4" /> Email Reply
                </a>
              </div>
              <button
                onClick={() => remove(selected.id)}
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-bold text-destructive hover:bg-destructive/10 rounded-xl py-2.5 transition-colors border border-destructive/20 mt-2"
              >
                <Trash2 className="h-4 w-4" /> Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{icon} {label}</div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
