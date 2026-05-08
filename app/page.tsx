"use client";

import { useEffect, useMemo, useState } from "react";
import HistoryPanel from "@/components/HistoryPanel";
import OutputPanel from "@/components/OutputPanel";
import SignalCard from "@/components/SignalCard";
import { defaultSignalType, getSignal, isVisualSignal, portraitPresets, signals } from "@/lib/signals";
import type { ExecuteResponse, ExecutionResult, PortraitPreset, SavedResult, SignalType } from "@/lib/types";

const HISTORY_KEY = "signalforge.savedResults.v2";
const LEGACY_HISTORY_KEY = "signalforge.savedResults.v1";

export default function Page() {
  const [selectedSignal, setSelectedSignal] = useState<SignalType>(defaultSignalType);
  const [input, setInput] = useState("");
  const [customInstruction, setCustomInstruction] = useState("");
  const [portraitPreset, setPortraitPreset] = useState<PortraitPreset | "">("");
  const [generateImageToo, setGenerateImageToo] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [history, setHistory] = useState<SavedResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const activeSignal = useMemo(() => getSignal(selectedSignal), [selectedSignal]);

  useEffect(() => {
    const savedHistory = window.localStorage.getItem(HISTORY_KEY) ?? window.localStorage.getItem(LEGACY_HISTORY_KEY);

    if (!savedHistory) return;

    try {
      const parsed = JSON.parse(savedHistory) as SavedResult[];
      if (Array.isArray(parsed)) {
        setHistory(parsed.map(normalizeSavedResult));
      }
    } catch {
      window.localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  async function executeSignal() {
    setIsLoading(true);
    setError("");
    setCopied(false);
    setSaved(false);

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signalType: selectedSignal,
          input,
          customInstruction: selectedSignal === "Custom" ? customInstruction : undefined,
          portraitPreset: selectedSignal === "Portrait" ? portraitPreset || undefined : undefined,
          generateImage: selectedSignal === "Portrait" ? true : selectedSignal === "Image Prompt" ? generateImageToo : false,
        }),
      });
      const data = (await response.json()) as ExecuteResponse;
      const nextResult = data.result ?? {
        kind: isVisualSignal(selectedSignal) ? "image" : "text",
        signalType: selectedSignal,
        output: data.output || data.error || "No output returned.",
      } satisfies ExecutionResult;

      setResult(nextResult);

      if (!response.ok || data.error) {
        setError(data.error || nextResult.output);
      } else if (nextResult.imageError) {
        setError(nextResult.imageError);
      }
    } catch {
      const message = "Signal execution failed. Check your connection and try again.";
      setResult({ kind: "text", signalType: selectedSignal, output: message });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function copyResult() {
    const text = result?.promptUsed || result?.output;
    if (!text) return;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function saveResult() {
    if (!result) return;

    const item: SavedResult = {
      ...result,
      id: createId(),
      input,
      createdAt: new Date().toISOString(),
      preview: createPreview(result),
    };
    const nextHistory = [item, ...history].slice(0, 30);

    persistHistory(nextHistory);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  }

  function clearResult() {
    setResult(null);
    setError("");
    setCopied(false);
    setSaved(false);
  }

  function restoreHistory(item: SavedResult) {
    setSelectedSignal(item.signalType as SignalType);
    setInput(item.input);
    setResult(item);
    setError(item.imageError ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearHistory() {
    setHistory([]);
    window.localStorage.removeItem(HISTORY_KEY);
  }

  function persistHistory(nextHistory: SavedResult[]) {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
      setHistory(nextHistory);
    } catch {
      const lighterHistory = nextHistory.map((item) =>
        item.imageDataUrl ? { ...item, imageDataUrl: undefined, imageStored: false } : item,
      );

      try {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(lighterHistory));
        setHistory(lighterHistory);
        setError("Saved the prompt and metadata. Image data was too large for localStorage.");
      } catch {
        setError("Could not save this result because localStorage is full.");
      }
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-void text-ivory">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(196,167,106,0.18),transparent_32%),radial-gradient(circle_at_82%_0%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.055),transparent_36%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(249,244,232,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,244,232,0.03)_1px,transparent_1px)] bg-[size:44px_44px] opacity-25" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-8">
        <header className="surface rounded-[2rem] p-5 sm:p-7">
          <p className="label text-gold/80">Premium AI execution cockpit</p>
          <div className="mt-5 flex flex-col gap-3">
            <h1 className="text-5xl font-semibold tracking-[-0.075em] text-ivory sm:text-7xl">SignalForge</h1>
            <p className="text-lg tracking-[-0.03em] text-ivory/60">One input. One execution. Stored.</p>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {signals.map((signal) => (
            <SignalCard
              key={signal.type}
              signal={signal}
              active={selectedSignal === signal.type}
              onSelect={() => {
                setSelectedSignal(signal.type);
                setError("");
                setCopied(false);
                setSaved(false);
              }}
            />
          ))}
        </section>

        <section className="surface rounded-[1.8rem] p-4 sm:p-5">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="label">Input</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.05em] text-ivory">{selectedSignal}</h2>
            </div>
            <span className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-bold text-gold">
              {selectedSignal === "Portrait" ? "Image auto" : selectedSignal === "Image Prompt" ? "Prompt first" : "Ready"}
            </span>
          </div>

          <textarea
            className="field min-h-52 resize-none text-base leading-7"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={activeSignal.placeholder}
          />

          {selectedSignal === "Portrait" ? (
            <div className="mt-4">
              <p className="label mb-3">Portrait preset</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  className={`pill ${portraitPreset === "" ? "pill-active" : ""}`}
                  type="button"
                  onClick={() => setPortraitPreset("")}
                >
                  Auto
                </button>
                {portraitPresets.map((preset) => (
                  <button
                    key={preset}
                    className={`pill ${portraitPreset === preset ? "pill-active" : ""}`}
                    type="button"
                    onClick={() => setPortraitPreset(preset)}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {selectedSignal === "Image Prompt" ? (
            <label className="mt-4 flex items-center justify-between gap-4 rounded-[1.25rem] border border-ivory/10 bg-black/25 p-4">
              <span>
                <span className="block text-sm font-bold text-ivory">Generate image too</span>
                <span className="mt-1 block text-xs leading-5 text-ivory/45">Off by default. Turn on when you want the finished visual now.</span>
              </span>
              <input
                className="h-5 w-5 accent-gold"
                type="checkbox"
                checked={generateImageToo}
                onChange={(event) => setGenerateImageToo(event.target.checked)}
              />
            </label>
          ) : null}

          {selectedSignal === "Custom" ? (
            <input
              className="field mt-3"
              value={customInstruction}
              onChange={(event) => setCustomInstruction(event.target.value)}
              placeholder="Optional custom instruction: turn this into a launch memo, premium pitch, exact checklist..."
            />
          ) : null}

          {error ? <p className="mt-3 text-sm text-red-200/80">{error}</p> : null}

          <button
            className="mt-4 w-full rounded-[1.35rem] bg-gold px-5 py-4 text-base font-black tracking-[-0.02em] text-black transition hover:bg-[#e7c983] disabled:pointer-events-none disabled:opacity-45"
            type="button"
            onClick={executeSignal}
            disabled={isLoading}
          >
            {isLoading ? "Executing..." : "Execute Signal"}
          </button>
        </section>

        <OutputPanel
          result={result}
          isLoading={isLoading}
          onCopy={copyResult}
          onSave={saveResult}
          onClear={clearResult}
          copied={copied}
          saved={saved}
        />

        <HistoryPanel items={history} onRestore={restoreHistory} onClearHistory={clearHistory} />
      </div>
    </main>
  );
}

function createPreview(result: ExecutionResult): string {
  return result.title || result.promptUsed || result.output;
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `signal-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}


function normalizeSavedResult(item: SavedResult): SavedResult {
  return {
    ...item,
    kind: item.kind ?? "text",
    preview: item.preview || item.title || item.promptUsed || item.output,
  };
}
