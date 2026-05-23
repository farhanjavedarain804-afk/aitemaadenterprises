// Site settings stored in localStorage
// All site-wide settings live here so any component can read/write them

export const SETTINGS_KEY = "ae_site_settings";

export type SiteSettings = {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  countdownEnabled: boolean;
  countdownDate: string; // ISO string
  countdownLabel: string;
};

const defaults: SiteSettings = {
  maintenanceMode: false,
  maintenanceMessage: "We are currently performing scheduled maintenance. We'll be back shortly.",
  countdownEnabled: true,
  countdownDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  countdownLabel: "Official Website Launching In",
};

export function getSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: Partial<SiteSettings>): SiteSettings {
  const current = getSettings();
  const next = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  // Dispatch storage event so other components can listen
  window.dispatchEvent(new StorageEvent("storage", { key: SETTINGS_KEY }));
  return next;
}
