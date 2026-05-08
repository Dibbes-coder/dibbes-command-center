"use client";

import { useEffect, useState } from "react";
import BeforeAfter from "@/components/BeforeAfter";
import BrandDNA from "@/components/BrandDNA";
import ImagePreview from "@/components/ImagePreview";
import IntentSelector from "@/components/IntentSelector";
import OutputCards from "@/components/OutputCards";
import RefineInput from "@/components/RefineInput";
import {
  BRAND_DNA_STORAGE_KEY,
  LAST_INPUT_STORAGE_KEY,
  LAST_OUTPUT_STORAGE_KEY,
  defaultBrandDNA,
  defaultIntents,
} from "@/lib/storage";
import type { BrandDNA as BrandDNAType, RefineResponse, RefinementIntent, RefinementResult } from "@/lib/types";

export default function Page() {
  const [input, setInput] = useState("");
  const [intents, setIntents] = useState<RefinementIntent[]>(defaultIntents);
  const [brandDNA, setBrandDNA] = useState<BrandDNAType>(defaultBrandDNA);
  const [generateVisual, setGenerateVisual] = useState(false);
  const [result, setResult] = useState<RefinementResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [imageError, setImageError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  useEffect(() => {
    try {
      const savedBrandDNA = window.localStorage.getItem(BRAND_DNA_STORAGE_KEY);
      const savedInput = window.localStorage.getItem(LAST_INPUT_STORAGE_KEY);
      const savedOutput = window.localStorage.getItem(LAST_OUTPUT_STORAGE_KEY);

      if (savedBrandDNA) {
        setBrandDNA({ ...defaultBrandDNA, ...JSON.parse(savedBrandDNA) });
      }

      if (savedInput) setInput(savedInput);
      if (savedOutput) setResult(JSON.parse(savedOutput));
    } catch {
      window.localStorage.removeItem(BRAND_DNA_STORAGE_KEY);
      window.localStorage.removeItem(LAST_OUTPUT_STORAGE_KEY);
    } finally {
      setHasLoadedStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) return;
    window.localStorage.setItem(BRAND_DNA_STORAGE_KEY, JSON.stringify(brandDNA));
  }, [brandDNA, hasLoadedStorage]);

  useEffect(() => {
    if (!hasLoadedStorage) return;
    window.localStorage.setItem(LAST_INPUT_STORAGE_KEY, input);
  }, [input, hasLoadedStorage]);

  useEffect(() => {
    if (!hasLoadedStorage) return;
    if (result) {
      window.localStorage.setItem(LAST_OUTPUT_STORAGE_KEY, JSON.stringify(result));
    }
  }, [result, hasLoadedStorage]);

  async function refineSignal(refineAgain = false) {
    const payloadInput = refineAgain && result ? result.refined_best : input;

    if (!payloadInput.trim()) {
      setError("Paste something rough first. Dibbes Refine needs material to refine.");
      return;
    }

    setIsLoading(true);
    setError("");
    setImageError(undefined);
    if (!refineAgain) setImageUrl(undefined);

    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: refineAgain && result ? result.original_input : input,
          intents,
          brandDNA,
          generateVisual,
          refineAgain,
          previousBest: refineAgain ? result?.refined_best : undefined,
          previousQualityBreakdown: refineAgain ? result?.quality_breakdown : undefined,
        }),
      });

      const data = (await response.json()) as RefineResponse;

      if (!response.ok || !data.result) {
        throw new Error(data.error || "Signal refinement failed.");
      }

      setResult(data.result);
      setImageUrl(data.imageUrl);
      setImageError(data.imageError);
    } catch (refineError) {
      setError(refineError instanceof Error ? refineError.message : "Signal refinement failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-void text-ivory">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(196,167,106,0.1),transparent_28%),radial-gradient(circle_at_82%_0%,rgba(247,240,223,0.045),transparent_24%),linear-gradient(180deg,rgba(247,240,223,0.026),transparent_36%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(247,240,223,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(247,240,223,0.018)_1px,transparent_1px)] bg-[size:48px_48px] opacity-25" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-3.5 px-4 py-4 sm:gap-4 sm:px-6 sm:py-8">
        <header className="py-5 text-center sm:py-10">
          <p className="label text-gold/55">Premium refinement engine</p>
          <h1 className="mt-3 flex flex-col items-center gap-1.5 text-ivory sm:mt-4 sm:gap-2" aria-label="Dibbes Refine">
            <span className="text-[10px] font-black uppercase tracking-[0.46em] text-gold/70 sm:text-xs">DIBBES</span>
            <span className="text-[3.25rem] font-semibold uppercase leading-[0.9] tracking-[0.14em] sm:text-7xl md:text-8xl">REFINE</span>
          </h1>
          <p className="mt-4 text-xl leading-tight tracking-[-0.045em] text-ivory/[0.84] sm:text-3xl">Input anything. Reveal the signal.</p>
          <p className="mx-auto mt-3 max-w-xl text-[13px] leading-5 text-ivory/50 sm:text-sm">
            A refinement engine for people who refuse generic output.
          </p>
        </header>

        <RefineInput value={input} onChange={setInput} />
        <IntentSelector selected={intents} onChange={setIntents} />
        <BrandDNA value={brandDNA} onChange={setBrandDNA} />

        <section className="surface-subtle rounded-[1.25rem] p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-2.5 text-xs uppercase tracking-[0.16em] text-ivory/[0.52] transition hover:text-ivory/[0.72]">
              <input
                type="checkbox"
                checked={generateVisual}
                onChange={(event) => setGenerateVisual(event.target.checked)}
                className="h-4 w-4 accent-gold"
              />
              Generate visual
            </label>
            <button
              type="button"
              onClick={() => refineSignal(false)}
              disabled={isLoading}
              className="instrument-button rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-void transition disabled:cursor-not-allowed disabled:opacity-55 sm:px-7"
            >
              {isLoading ? "Refining…" : "Refine Signal"}
            </button>
          </div>
          {error ? <p className="mt-3 rounded-[0.9rem] border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">{error}</p> : null}
        </section>

        {result ? (
          <div className="flex flex-col gap-5">
            <BeforeAfter result={result} />
            <OutputCards result={result} />
            <ImagePreview imageUrl={imageUrl} imageError={imageError} />
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => refineSignal(true)}
                disabled={isLoading}
                className="rounded-full border border-gold/35 bg-gold/[0.08] px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-gold transition hover:bg-gold/15 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isLoading ? "Refining…" : "Refine Again"}
              </button>
            </div>
          </div>
        ) : null}

        <details className="surface-subtle group mb-10 rounded-[1.25rem] p-3 sm:p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
            <div>
              <p className="label text-gold/55">Plans</p>
              <p className="mt-1 text-xs leading-5 text-ivory/[0.42]">Refinement comes first. Plans can wait.</p>
            </div>
            <span className="rounded-full border border-ivory/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-ivory/45 transition group-hover:border-gold/25 group-hover:text-gold/70 group-open:hidden">Open</span>
            <span className="hidden rounded-full border border-gold/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gold/70 group-open:inline">Close</span>
          </summary>
          <section className="mt-3 grid gap-2 sm:grid-cols-3">
            {[
              ["Free", "Refine a few signals."],
              ["Pro", "Daily refinement, visual generation, saved Brand DNA."],
              ["Studio", "Client-ready brand refinement workflows."],
            ].map(([tier, copy]) => (
              <div key={tier} className="rounded-[1rem] border border-ivory/[0.08] bg-black/15 p-3">
                <p className="label text-gold/60">{tier}</p>
                <p className="mt-2 text-xs leading-5 text-ivory/[0.52]">{copy}</p>
              </div>
            ))}
          </section>
        </details>
      </div>
    </main>
  );
}
