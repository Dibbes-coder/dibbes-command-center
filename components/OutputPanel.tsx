"use client";

import { useMemo, useState } from "react";
import type { ExecutionResult } from "@/lib/types";

type OutputPanelProps = {
  result: ExecutionResult | null;
  isLoading: boolean;
  onCopy: () => void;
  onSave: () => void;
  onClear: () => void;
  copied: boolean;
  saved: boolean;
};

type OutputTab = "Result" | "Prompt Used" | "Rationale";

export default function OutputPanel({ result, isLoading, onCopy, onSave, onClear, copied, saved }: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState<OutputTab>("Result");
  const tabs = useMemo<OutputTab[]>(() => {
    if (result?.kind === "image") return ["Result", "Prompt Used", "Rationale"];
    return ["Result"];
  }, [result?.kind]);

  function downloadImage() {
    if (!result?.imageDataUrl) return;

    const link = document.createElement("a");
    link.href = result.imageDataUrl;
    link.download = `${slugify(result.title || result.signalType || "signalforge-image")}.png`;
    link.click();
  }

  const canDownload = Boolean(result?.imageDataUrl);

  return (
    <section className="surface rounded-[1.8rem] p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="label">Output</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-ivory">
            {result?.title || "Result"}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 rounded-[1.35rem] border border-ivory/10 bg-black/25 p-1">
          <button className="mini-button" type="button" onClick={onCopy} disabled={!result || isLoading}>
            {copied ? "Copied" : result?.kind === "image" ? "Copy prompt" : "Copy"}
          </button>
          <button className="mini-button" type="button" onClick={onSave} disabled={!result || isLoading}>
            {saved ? "Saved" : "Save"}
          </button>
          {result?.kind === "image" ? (
            <button className="mini-button" type="button" onClick={downloadImage} disabled={!canDownload || isLoading}>
              Download
            </button>
          ) : null}
          <button className="mini-button" type="button" onClick={onClear} disabled={!result || isLoading}>
            Clear
          </button>
        </div>
      </div>

      {result?.kind === "image" ? (
        <div className="mb-4 grid grid-cols-3 gap-2 rounded-full border border-ivory/10 bg-black/25 p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`rounded-full px-3 py-2 text-xs font-black transition ${
                activeTab === tab ? "bg-gold text-black" : "text-ivory/50 hover:text-ivory"
              }`}
              type="button"
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      ) : null}

      <div className="min-h-64 rounded-[1.4rem] border border-ivory/10 bg-black/35 p-3 sm:p-4">
        {isLoading ? (
          <div className="flex h-72 flex-col items-center justify-center gap-4 text-center text-ivory/60">
            <span className="h-10 w-10 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
            <p className="max-w-xs text-sm leading-6">Forging a polished result. Visual signals can take a little longer.</p>
          </div>
        ) : result ? (
          renderResult(result, activeTab)
        ) : (
          <div className="flex h-72 items-center justify-center text-center text-sm leading-6 text-ivory/40">
            Type a rough signal. Press execute. Receive something polished enough to use.
          </div>
        )}
      </div>
    </section>
  );
}

function renderResult(result: ExecutionResult, activeTab: OutputTab) {
  if (result.kind !== "image") {
    return <pre className="whitespace-pre-wrap break-words font-sans text-[15px] leading-7 text-ivory/90">{result.output}</pre>;
  }

  if (activeTab === "Prompt Used") {
    return (
      <div className="rounded-[1.15rem] bg-ivory/[0.035] p-4">
        <p className="label mb-3">Final prompt</p>
        <pre className="whitespace-pre-wrap break-words font-sans text-[14px] leading-7 text-ivory/82">
          {result.promptUsed || result.output}
        </pre>
      </div>
    );
  }

  if (activeTab === "Rationale") {
    return (
      <div className="rounded-[1.15rem] bg-ivory/[0.035] p-4">
        <p className="label mb-3">Creative rationale</p>
        <p className="text-[15px] leading-7 text-ivory/82">{result.rationale || "Built for a polished, usable result."}</p>
        {result.imageError ? <p className="mt-4 text-sm leading-6 text-red-200/80">{result.imageError}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {result.imageDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="mx-auto w-full max-w-2xl rounded-[1.35rem] border border-ivory/10 bg-black object-cover shadow-2xl shadow-black/60"
          src={result.imageDataUrl}
          alt={result.title || "Generated SignalForge image"}
        />
      ) : result.imageError ? (
        <div className="flex min-h-80 items-center justify-center rounded-[1.35rem] border border-dashed border-ivory/15 bg-black/30 p-6 text-center text-sm leading-6 text-ivory/50">
          {result.imageError}
        </div>
      ) : (
        <div className="rounded-[1.35rem] border border-ivory/10 bg-ivory/[0.035] p-4">
          <p className="label mb-3">Prompt ready</p>
          <pre className="whitespace-pre-wrap break-words font-sans text-[14px] leading-7 text-ivory/82">
            {result.promptUsed || result.output}
          </pre>
          <p className="mt-4 text-sm leading-6 text-ivory/45">
            {result.imageStored === false
              ? "Image data was not stored locally, but the prompt and rationale were saved."
              : "Turn on Generate image too when you want the finished visual in one execution."}
          </p>
        </div>
      )}
      {result.imageError ? <p className="text-sm leading-6 text-red-200/80">{result.imageError}</p> : null}
    </div>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);
}
