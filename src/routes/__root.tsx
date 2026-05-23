import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldOff, Wrench, Lock, Clock, ArrowRight } from "lucide-react";

import appCss from "../styles.css?url";
import { getSettings, type SiteSettings } from "@/lib/settings";
import { initAnalytics } from "@/lib/analytics";
import logo from "@/assets/logo.png";
import logoWhite from "@/assets/logo-white.png";

// ── Reactive settings hook ─────────────────────────────────────────────────
function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(getSettings);
  useEffect(() => {
    const handler = () => setSettings(getSettings());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  return settings;
}

// ── Live clock for maintenance page ───────────────────────────────────────
function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// ── Full-screen maintenance page ──────────────────────────────────────────
function MaintenancePage({ message }: { message: string }) {
  const now = useLiveClock();
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2a14] via-[#0f3d1f] to-[#0a2a14] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-accent/15 blur-[120px] pointer-events-none" />

      {/* Animated ring */}
      <div className="relative mb-10">
        <div className="h-36 w-36 rounded-full border-4 border-white/20 flex items-center justify-center animate-pulse">
          <div className="h-28 w-28 rounded-full border-4 border-white/10 bg-white/5 backdrop-blur flex items-center justify-center">
            <img
              src={logoWhite}
              alt="Aitemaad Enterprises"
              className="h-16 w-16 object-contain drop-shadow-2xl"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
        </div>
        <div className="absolute -top-2 -right-2 h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
          <Wrench className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Badge */}
      <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
        <ShieldOff className="h-3.5 w-3.5" />
        Under Maintenance
      </div>

      {/* Title */}
      <h1 className="text-4xl sm:text-5xl font-bold text-white text-center leading-tight max-w-xl">
        We'll Be Back <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]">Shortly</span>
      </h1>

      {/* Message */}
      <p className="mt-5 text-center text-white/70 text-base sm:text-lg max-w-lg leading-relaxed">
        {message}
      </p>

      {/* Live clock */}
      <div className="mt-8 flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur rounded-2xl px-6 py-4">
        <Clock className="h-5 w-5 text-accent" />
        <div>
          <div className="text-white/50 text-xs uppercase tracking-wider mb-0.5">Current Time</div>
          <div className="text-white font-mono text-lg font-bold tabular-nums">
            {now.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
        </div>
        <div className="w-px h-8 bg-white/10 mx-2" />
        <div>
          <div className="text-white/50 text-xs uppercase tracking-wider mb-0.5">Date</div>
          <div className="text-white text-sm font-medium">
            {now.toLocaleDateString("en-PK", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="mt-8 text-center">
        <p className="text-white/40 text-sm mb-3">Need urgent help?</p>
        <a
          href="https://wa.me/923300602357"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#20bd5a] transition-colors shadow-lg"
        >
          Contact on WhatsApp <ArrowRight className="h-4 w-4" />
        </a>
      </div>



      {/* Footer */}
      <div className="absolute bottom-4 text-white/20 text-xs text-center">
        © {new Date().getFullYear()} Aitemaad Enterprises. All rights reserved.
      </div>
    </div>
  );
}

// ── Guard that blocks public pages during maintenance ──────────────────────
function MaintenanceGuard({ settings, children }: { settings: SiteSettings; children: React.ReactNode }) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Admin routes are always accessible
  const isAdminRoute = currentPath.startsWith("/admin");

  if (settings.maintenanceMode && !isAdminRoute) {
    return <MaintenancePage message={settings.maintenanceMessage} />;
  }

  return <>{children}</>;
}

// ── 404 ────────────────────────────────────────────────────────────────────
function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Error ──────────────────────────────────────────────────────────────────
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Route ──────────────────────────────────────────────────────────────────
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const settings = useSiteSettings();

  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <MaintenanceGuard settings={settings}>
        <Outlet />
      </MaintenanceGuard>
    </QueryClientProvider>
  );
}
