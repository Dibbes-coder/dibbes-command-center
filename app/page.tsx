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
      setError("Paste something rough first. SignalForge needs material to refine.");
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
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_5%,rgba(196,167,106,0.14),transparent_31%),radial-gradient(circle_at_82%_0%,rgba(247,240,223,0.07),transparent_26%),linear-gradient(180deg,rgba(247,240,223,0.04),transparent_38%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(247,240,223,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(247,240,223,0.025)_1px,transparent_1px)] bg-[size:52px_52px] opacity-30" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header className="py-12 text-center sm:py-16">
          <p className="label text-gold/75">Premium refinement engine</p>
          <h1 className="mt-5 text-6xl font-semibold tracking-[-0.085em] text-ivory sm:text-8xl">SignalForge</h1>
          <p className="mt-5 text-2xl tracking-[-0.045em] text-ivory/82 sm:text-4xl">Input anything. Reveal the signal.</p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-ivory/52 sm:text-base">
            An AI refinement engine for creators, founders, and brands who refuse generic output.
          </p>
        </header>

        <RefineInput value={input} onChange={setInput} />
        <IntentSelector selected={intents} onChange={setIntents} />
        <BrandDNA value={brandDNA} onChange={setBrandDNA} />

        <section className="surface rounded-[1.7rem] p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-ivory/65">
              <input
                type="checkbox"
                checked={generateVisual}
                onChange={(event) => setGenerateVisual(event.target.checked)}
                className="h-5 w-5 accent-gold"
              />
              Generate visual
            </label>
            <button
              type="button"
              onClick={() => refineSignal(false)}
              disabled={isLoading}
              className="rounded-full bg-gold px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-void transition hover:bg-[#d9bd80] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isLoading ? "Refining…" : "Refine Signal"}
            </button>
          </div>
          {error ? <p className="mt-4 rounded-[1rem] border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">{error}</p> : null}
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

        <section className="grid gap-3 pb-10 sm:grid-cols-3">
          {[
            ["Free", "Refine a few signals."],
            ["Pro", "Daily refinement, visual generation, saved Brand DNA."],
            ["Studio", "Client-ready brand refinement workflows."],
          ].map(([tier, copy]) => (
            <div key={tier} className="rounded-[1.4rem] border border-ivory/10 bg-ivory/[0.035] p-5">
              <p className="label text-gold/70">{tier}</p>
              <p className="mt-3 text-sm leading-6 text-ivory/58">{copy}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
