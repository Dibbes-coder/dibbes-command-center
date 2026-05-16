import type { HistoryItem, IntentOption, VoiceMode, VoiceProfile } from "./types";

export const PROFILE_STORAGE_KEY = "dibbes-refine.signal-profile.v2";
export const LEGACY_PROFILE_STORAGE_KEY = "dibbes-refine.profile.v1";
export const HISTORY_STORAGE_KEY = "dibbes-refine.history.v1";

export const intentOptions: IntentOption[] = [
  "Auto-pick best intent",
  "Add signal",
  "Disagree elegantly",
  "Be funny",
  "Ask a smart question",
  "Sound premium",
  "Be bold",
  "Be warm",
  "Make them curious",
];

export const voiceModes: VoiceMode[] = [
  "Auto-pick best signal mode",
  "Dibbes default",
  "Still + sly",
  "Warm intelligence",
  "High signal",
  "Elegant disagreement",
  "Viral but human",
];

export const defaultProfile: VoiceProfile = {
  handle: "@Dibbes101",
  coreTone:
    "Still + sly. High signal. Short, present, intelligent, lightly playful. Never needy. Never generic. Never engagement-bait.",
  avoid:
    "Hashtag stuffing, fake guru tone, corporate LinkedIn tone, cheap controversy, sounding bigger than the account, forced virality, overexplaining.",
  signaturePhrases: "signal, noise, rare ones, awake, move by signal",
  preferredLength: "Short to medium. Usually 1–3 sentences.",
  personalStance:
    "Small account with sharp signal. Wants to sound thoughtful, original, human, and worth following without pretending to be famous.",
};

export function loadProfile(): VoiceProfile {
  if (typeof window === "undefined") return defaultProfile;

  try {
    const stored =
      window.localStorage.getItem(PROFILE_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_PROFILE_STORAGE_KEY);
    if (!stored) return defaultProfile;
    const parsed = JSON.parse(stored) as Partial<VoiceProfile>;
    return { ...defaultProfile, ...parsed };
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(profile: VoiceProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}

export function saveHistory(items: HistoryItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items.slice(0, 5)));
}