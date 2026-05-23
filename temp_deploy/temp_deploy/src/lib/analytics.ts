import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "ae_visitor_session";
const TRACKING_INTERVAL = 10000; // Ping every 10 seconds

// Generate a random ID
function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Get or create session ID
function getSessionId() {
  if (typeof window === "undefined") return "unknown";
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = generateId();
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

// Simple device detection
function getDeviceType() {
  if (typeof window === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile";
  return "Desktop";
}

let isInitialized = false;
let lastPingTime = 0;

export async function initAnalytics() {
  if (typeof window === "undefined" || isInitialized) return;
  isInitialized = true;

  const sessionId = getSessionId();
  const currentPath = window.location.pathname;

  // Don't track admin users in the dashboard
  if (currentPath.startsWith("/admin")) return;

  try {
    // 1. Fetch Location Data
    let ip = "Unknown";
    let location = "Unknown";
    
    try {
      const geoRes = await fetch("https://ipapi.co/json/");
      if (geoRes.ok) {
        const geo = await geoRes.json();
        ip = geo.ip || "Unknown";
        location = `${geo.city || "Unknown City"}, ${geo.country_name || "Unknown Country"}`;
      }
    } catch (e) {
      console.warn("Could not fetch geolocation", e);
    }

    // 2. Initial Insert
    const { error } = await supabase.from("analytics").insert({
      session_id: sessionId,
      ip_address: ip,
      location: location,
      device: getDeviceType(),
      browser: navigator.userAgent,
      page_url: currentPath,
      stay_time_seconds: 0
    });

    if (error) {
      // If table doesn't exist yet, just silently fail so site doesn't break
      console.warn("Analytics insert failed. Table might not exist yet.", error);
      return; 
    }

    lastPingTime = Date.now();

    // 3. Heartbeat Ping
    setInterval(async () => {
      const now = Date.now();
      const addSeconds = Math.floor((now - lastPingTime) / 1000);
      lastPingTime = now;

      try {
        // Fetch current to increment time
        const { data } = await supabase
          .from("analytics")
          .select("stay_time_seconds")
          .eq("session_id", sessionId)
          .single();

        if (data) {
          await supabase
            .from("analytics")
            .update({
              stay_time_seconds: (data.stay_time_seconds || 0) + addSeconds,
              last_active_at: new Date().toISOString(), // Supabase usually auto-updates this if configured, but we force it
              page_url: window.location.pathname // Track if they moved pages
            })
            .eq("session_id", sessionId);
        }
      } catch (e) {
        // Silent fail
      }
    }, TRACKING_INTERVAL);

  } catch (err) {
    console.error("Analytics initialization error", err);
  }
}
