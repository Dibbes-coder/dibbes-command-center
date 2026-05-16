"use client";

import { useEffect, useState } from "react";
import HistoryList from "@/components/HistoryList";
import OutputCard from "@/components/OutputCard";
import RefineForm from "@/components/RefineForm";
import SignalSettings from "@/components/SignalSettings";
import { defaultProfile, loadHistory, loadProfile, saveHistory, saveProfile, voiceModes, intentOptions } from "@/lib/storage";
import type { HistoryItem, IntentOption, RefineApiResponse, RefineResult, VoiceMode, VoiceProfile } from "@/lib/types";

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

  useEffect(() => {
    setProfile(loadProfile());
    setHistory(loadHistory());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveProfile(profile);
  }, [hydrated, profile]);

  function updateHistory(items: HistoryItem[]) {
    const nextHistory = items.slice(0, 5);
    setHistory(nextHistory);
    saveHistory(nextHistory);
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

  async function handleSubmit() {
    if (!postContext.trim() && !xPostUrl.trim() && !screenshotDataUrl) {
      setError("Paste copy, add an X link, or upload a screenshot first.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postContext, xPostUrl, screenshotDataUrl, roughReply, intent, voiceMode, profile }),
      });
      const data = (await response.json()) as RefineApiResponse;

      if (!response.ok || data.error || !data.bestReply) {
        throw new Error(data.error || "Refinement failed.");
      }

      const refinedResult = data as RefineResult;
      setResult(refinedResult);
      updateHistory([
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          postContext,
          xPostUrl,
          screenshotName,
          roughReply,
          intent,
          voiceMode,
          result: refinedResult,
        },
        ...history,
      ]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Something went quiet in the wrong way. Try again.");
    } finally {
      setIsLoading(false);
    }
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