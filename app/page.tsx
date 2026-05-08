"use client";

import { useEffect, useMemo, useState } from "react";
import { HistoryPanel } from "@/components/HistoryPanel";
import { OutputPanel } from "@/components/OutputPanel";
import { SignalCard } from "@/components/SignalCard";
import { getSignalDefinition, SIGNALS, type SignalType } from "@/lib/signals";
import { createHistoryItem, loadHistory, saveHistory, type HistoryItem } from "@/lib/storage";

type ExecuteResponse = {
  ok: boolean;
  output?: string;
  signalType?: SignalType;
  title?: string;
  model?: string;
  error?: string;
};

export default function Page() {
  const [selectedSignal, setSelectedSignal] = useState<SignalType>("Portrait");
  const [input, setInput] = useState("");
  const [customInstruction, setCustomInstruction] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedOutput, setSavedOutput] = useState(false);
  const [notice, setNotice] = useState("");

  const signal = useMemo(() => getSignalDefinition(selectedSignal), [selectedSignal]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  function selectSignal(signalType: SignalType) {
    setSelectedSignal(signalType);
    setError("");
    setOutput("");
    setSavedOutput(false);
  }

  async function executeSignal() {
    setLoading(true);
    setError("");
    setNotice("");
    setSavedOutput(false);

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signalType: selectedSignal,
          input,
          customInstruction: selectedSignal === "Custom" ? customInstruction : undefined,
        }),
      });
      const payload = (await response.json()) as ExecuteResponse;

      if (!response.ok || !payload.ok || !payload.output) {
        throw new Error(payload.error ?? "Execution failed. Try again.");
      }

      setOutput(payload.output);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Execution failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyOutput() {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setNotice("Copied.");
    } catch {
      setNotice("Copy failed. Select the output and copy manually.");
    }
  }

  function saveOutput() {
    if (!output) return;

    const item = createHistoryItem({
      signalType: selectedSignal,
      input,
      output,
      customInstruction: selectedSignal === "Custom" ? customInstruction : undefined,
    });
    const nextHistory = [item, ...history].slice(0, 50);
    setHistory(nextHistory);
    saveHistory(nextHistory);
    setSavedOutput(true);
    setNotice("Saved to history.");
  }

  function openHistoryItem(item: HistoryItem) {
    setSelectedSignal(item.signalType);
    setInput(item.input);
    setCustomInstruction(item.customInstruction ?? "");
    setOutput(item.output);
    setError("");
    setSavedOutput(true);
    setNotice("Loaded from history.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearHistory() {
    setHistory([]);
    saveHistory([]);
    setNotice("History cleared.");
  }

  return (
    <main className="min-h-screen bg-[#050505] text-stone-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(245,158,11,0.16),transparent_32%),radial-gradient(circle_at_95%_10%,rgba(255,255,255,0.08),transparent_24%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-32 pt-5 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:pb-10 lg:pt-8">
        <section className="grid gap-5">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-300/80">Signal in. Output out.</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-white sm:text-6xl">Dibbes Command Center</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
              Pick a signal, paste raw input, press execute. Dibbes fills in the missing details.
            </p>
          </header>

          <section className="grid gap-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">Choose signal</p>
                <h2 className="mt-1 text-xl font-semibold text-white">{signal.label}</h2>
              </div>
              <span className="hidden rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-500 sm:inline">{signal.outputHint}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SIGNALS.map((item) => (
                <SignalCard key={item.type} signal={item} selected={item.type === selectedSignal} onSelect={selectSignal} />
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/30 sm:p-5">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">Raw input</span>
              <textarea
                className="mt-3 min-h-48 w-full resize-y rounded-3xl border border-white/10 bg-black/45 px-4 py-4 text-base leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-300/70 focus:ring-4 focus:ring-amber-300/10"
                placeholder={signal.placeholder}
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
            </label>

            {selectedSignal === "Custom" ? (
              <label className="mt-4 block">
                <span className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">Custom instruction</span>
                <textarea
                  className="mt-3 min-h-28 w-full resize-y rounded-3xl border border-white/10 bg-black/45 px-4 py-4 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-300/70 focus:ring-4 focus:ring-amber-300/10"
                  placeholder="Tell Dibbes exactly what to do with the input. If blank, it will improve and structure it intelligently."
                  value={customInstruction}
                  onChange={(event) => setCustomInstruction(event.target.value)}
                />
              </label>
            ) : null}

            <button
              className="mt-4 hidden w-full rounded-3xl bg-amber-300 px-6 py-4 text-base font-black text-black transition hover:bg-amber-200 disabled:pointer-events-none disabled:opacity-50 sm:block"
              disabled={loading}
              onClick={() => void executeSignal()}
            >
              {loading ? "Executing…" : "Execute Signal"}
            </button>
          </section>

          <OutputPanel
            output={output}
            error={error}
            loading={loading}
            saved={savedOutput}
            onCopy={() => void copyOutput()}
            onSave={saveOutput}
            onRerun={() => void executeSignal()}
          />

          {notice ? <p className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-center text-sm font-semibold text-emerald-100">{notice}</p> : null}
        </section>

        <HistoryPanel history={history} onOpen={openHistoryItem} onClear={clearHistory} />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#050505]/90 p-3 backdrop-blur sm:hidden">
        <button
          className="w-full rounded-3xl bg-amber-300 px-6 py-4 text-base font-black text-black transition active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
          disabled={loading}
          onClick={() => void executeSignal()}
        >
          {loading ? "Executing…" : "Execute Signal"}
        </button>
      </div>
    </main>
  );
}
