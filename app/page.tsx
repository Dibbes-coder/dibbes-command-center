"use client";

import { useEffect, useRef, useState } from "react";
import HistoryList from "@/components/HistoryList";
import OutputCard from "@/components/OutputCard";
import RefineForm from "@/components/RefineForm";
import SignalSettings from "@/components/SignalSettings";
import { defaultProfile, loadHistory, loadProfile, saveHistory, saveProfile, voiceModes, intentOptions } from "@/lib/storage";
import type { HistoryItem, IntentOption, RefineApiResponse, RefineResult, VoiceMode, VoiceProfile } from "@/lib/types";

type RefineOverrides = {
  postContext?: string;
  xPostUrl?: string;
  screenshotDataUrl?: string;
  screenshotName?: string;
  roughReply?: string;
};

export default function Page() {
  const [postContext, setPostContext] = useState("");
  const [xPostUrl, setXPostUrl] = useState("");
  const [screenshotDataUrl, setScreenshotDataUrl] = useState("");
  const [screenshotName, setScreenshotName] = useState("");
  const [roughReply, setRoughReply] = useState("");
  const [intent, setIntent] = useState<IntentOption>(intentOptions[0]);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>(voiceModes[0]);
  const [profile, setProfile] = useState<VoiceProfile>(defaultProfile);
  const [result, setResult] = useState<RefineResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const autoRunKeyRef = useRef("");

  useEffect(() => {
    setProfile(loadProfile());
    setHistory(loadHistory());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveProfile(profile);
  }, [hydrated, profile]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;

    function syncArchiveFromStorage() {
      setHistory(loadHistory());
    }

    window.addEventListener("focus", syncArchiveFromStorage);
    window.addEventListener("pageshow", syncArchiveFromStorage);
    window.addEventListener("storage", syncArchiveFromStorage);
    document.addEventListener("visibilitychange", syncArchiveFromStorage);

    return () => {
      window.removeEventListener("focus", syncArchiveFromStorage);
      window.removeEventListener("pageshow", syncArchiveFromStorage);
      window.removeEventListener("storage", syncArchiveFromStorage);
      document.removeEventListener("visibilitychange", syncArchiveFromStorage);
    };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;

    const sharedUrl = extractSharedUrlFromLocation(window.location.href);
    if (!sharedUrl) return;

    const autoRunKey = `${sharedUrl}:auto`;
    if (autoRunKeyRef.current === autoRunKey) return;
    autoRunKeyRef.current = autoRunKey;

    setPostContext("");
    setXPostUrl(sharedUrl);
    setScreenshotDataUrl("");
    setScreenshotName("");
    setRoughReply("");
    setResult(null);
    setError("");
    window.history.replaceState(null, "", window.location.pathname);

    void runRefinement({
      postContext: "",
      xPostUrl: sharedUrl,
      screenshotDataUrl: "",
      screenshotName: "",
      roughReply: "",
    });
  }, [hydrated]);

  function updateHistory(items: HistoryItem[]) {
    const nextHistory = items.slice(0, 5);
    setHistory(nextHistory);
    saveHistory(nextHistory);
  }

  function archiveResult(item: HistoryItem) {
    setHistory((currentHistory) => {
      const nextHistory = [item, ...currentHistory].slice(0, 5);
      saveHistory(nextHistory);
      return nextHistory;
    });
  }

  function clearCurrentSignals() {
    setResult(null);
    setError("");
  }

  function handlePostContextChange(value: string) {
    clearCurrentSignals();
    setPostContext(value);
    if (value.trim()) {
      setXPostUrl("");
      setScreenshotDataUrl("");
      setScreenshotName("");
    }
  }

  function handleXPostUrlChange(value: string) {
    clearCurrentSignals();
    setXPostUrl(value);
    if (value.trim()) {
      setPostContext("");
      setScreenshotDataUrl("");
      setScreenshotName("");
    }
  }

  function handleScreenshotChange(dataUrl: string, fileName: string) {
    clearCurrentSignals();
    setScreenshotDataUrl(dataUrl);
    setScreenshotName(fileName);
    if (dataUrl) {
      setPostContext("");
      setXPostUrl("");
    }
  }

  async function runRefinement(overrides: RefineOverrides = {}) {
    const activePostContext = overrides.postContext ?? postContext;
    const activeXPostUrl = overrides.xPostUrl ?? xPostUrl;
    const activeScreenshotDataUrl = overrides.screenshotDataUrl ?? screenshotDataUrl;
    const activeScreenshotName = overrides.screenshotName ?? screenshotName;
    const activeRoughReply = overrides.roughReply ?? roughReply;

    if (!activePostContext.trim() && !activeXPostUrl.trim() && !activeScreenshotDataUrl) {
      setError("Paste copy, add an X link, or upload a screenshot first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postContext: activePostContext,
          xPostUrl: activeXPostUrl,
          screenshotDataUrl: activeScreenshotDataUrl,
          roughReply: activeRoughReply,
          intent,
          voiceMode,
          profile,
        }),
      });
      const data = (await response.json()) as RefineApiResponse;

      if (!response.ok || data.error || !data.bestReply) {
        throw new Error(data.error || "Refinement failed.");
      }

      const refinedResult = data as RefineResult;
      setResult(refinedResult);
      archiveResult({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        postContext: activePostContext,
        xPostUrl: activeXPostUrl,
        screenshotName: activeScreenshotName,
        roughReply: activeRoughReply,
        intent,
        voiceMode,
        result: refinedResult,
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Something went quiet in the wrong way. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit() {
    void runRefinement();
  }

  function openHistory(item: HistoryItem) {
    setPostContext(item.postContext);
    setXPostUrl(item.xPostUrl ?? "");
    setScreenshotDataUrl("");
    setScreenshotName(item.screenshotName ?? "");
    setRoughReply(item.roughReply);
    setIntent(item.intent as IntentOption);
    setVoiceMode(item.voiceMode as VoiceMode);
    setResult(item.result);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-ivory">
      <div className="pointer-events-none fixed inset-0 opacity-80">
        <div className="absolute left-1/2 top-[-12rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gold/[0.07] blur-3xl" />
        <div className="absolute bottom-[-16rem] right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-gold/[0.04] blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <header className="pb-4 pt-8 sm:pb-8 sm:pt-12">
          <div className="inline-flex rounded-full border border-gold/20 bg-gold/[0.04] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-gold/90">
            Hyper-intelligent X reply refinery
          </div>
          <h1 className="mt-6 text-5xl font-semibold tracking-[-0.06em] text-ivory sm:text-7xl lg:text-8xl">
            Dibbes Refine
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-400 sm:text-xl">
            One post in. Five sharper ways to enter the conversation.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="grid gap-6">
            <RefineForm
              postContext={postContext}
              xPostUrl={xPostUrl}
              screenshotDataUrl={screenshotDataUrl}
              screenshotName={screenshotName}
              roughReply={roughReply}
              intent={intent}
              voiceMode={voiceMode}
              isLoading={isLoading}
              error={error}
              onPostContextChange={handlePostContextChange}
              onXPostUrlChange={handleXPostUrlChange}
              onScreenshotChange={handleScreenshotChange}
              onRoughReplyChange={setRoughReply}
              onIntentChange={setIntent}
              onVoiceModeChange={setVoiceMode}
              onSubmit={handleSubmit}
            />
            <SignalSettings profile={profile} onChange={setProfile} />
            <HistoryList history={history} onOpen={openHistory} onClear={() => updateHistory([])} />
          </div>

          <div className="lg:sticky lg:top-6">
            <OutputCard result={result} />
          </div>
        </div>
      </div>
    </main>
  );
}

function extractSharedUrlFromLocation(href: string): string {
  try {
    const currentUrl = new URL(href);
    const params = currentUrl.searchParams;
    const directValue = params.get("xUrl") ?? params.get("url") ?? params.get("text") ?? "";
    const directMatch = cleanSharedUrl(directValue);
    if (directMatch) return directMatch;

    const rawQuery = href.split("?")[1] ?? "";
    const rawMatch = rawQuery.match(/(?:xUrl|url|text)=([^&]+)/i);
    return cleanSharedUrl(rawMatch ? rawMatch[1] : rawQuery);
  } catch {
    return cleanSharedUrl(href);
  }
}

function cleanSharedUrl(value: string | null): string {
  if (!value) return "";
  const decoded = safeDecode(value.replace(/\+/g, " "));
  const trimmed = decoded.trim();
  const match = trimmed.match(/https?:\/\/[^\s&]+/i);
  return match ? match[0] : "";
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
