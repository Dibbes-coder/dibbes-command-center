"use client";

import { useRef, useState } from "react";
import IntentSelector from "./IntentSelector";
import type { IntentOption, VoiceMode } from "@/lib/types";

type RefineFormProps = {
  postContext: string;
  xPostUrl: string;
  screenshotDataUrl: string;
  screenshotName: string;
  roughReply: string;
  intent: string;
  voiceMode: string;
  isLoading: boolean;
  error: string;
  onPostContextChange: (value: string) => void;
  onXPostUrlChange: (value: string) => void;
  onScreenshotChange: (dataUrl: string, fileName: string) => void;
  onRoughReplyChange: (value: string) => void;
  onIntentChange: (value: IntentOption) => void;
  onVoiceModeChange: (value: VoiceMode) => void;
  onSubmit: () => void;
};

const MAX_SCREENSHOT_BYTES = 8 * 1024 * 1024;
const TARGET_DATA_URL_LENGTH = 2_800_000;

export default function RefineForm({
  postContext,
  xPostUrl,
  screenshotDataUrl,
  screenshotName,
  roughReply,
  intent,
  voiceMode,
  isLoading,
  error,
  onPostContextChange,
  onXPostUrlChange,
  onScreenshotChange,
  onRoughReplyChange,
  onIntentChange,
  onVoiceModeChange,
  onSubmit,
}: RefineFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [screenshotError, setScreenshotError] = useState("");
  const hasAnyContext = Boolean(postContext.trim() || xPostUrl.trim() || screenshotDataUrl);

  function clearForPaste(value: string, clear: () => void) {
    if (!value.trim()) return;
    clear();
  }

  async function handleScreenshotUpload(file: File | undefined) {
    setScreenshotError("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setScreenshotError("Upload a PNG, JPG, or WEBP screenshot.");
      return;
    }

    if (file.type === "image/svg+xml") {
      setScreenshotError("SVG screenshots are not supported. Use PNG, JPG, or WEBP.");
      return;
    }

    if (file.size > MAX_SCREENSHOT_BYTES) {
      setScreenshotError("Screenshot is too large. Use a smaller image or crop it first.");
      return;
    }

    try {
      const dataUrl = await compressImageToDataUrl(file);
      onScreenshotChange(dataUrl, file.name);
    } catch {
      setScreenshotError("Could not read this screenshot. Try a PNG or JPG version.");
    }
  }

  function clearScreenshot() {
    onScreenshotChange("", "");
    setScreenshotError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <section className="surface rounded-[1.4rem] p-5 sm:p-7">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="label text-gold/70">Input</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ivory">Drop the signal.</h2>
        </div>
        <p className="hidden max-w-[15rem] text-right text-xs leading-5 text-stone-500 sm:block">
          Tap a filled field to clear it for pasting.
        </p>
      </div>

      <div className="grid gap-4">
        <label className="block">
          <span className="label">X link</span>
          <input
            value={xPostUrl}
            onPointerDown={() => clearForPaste(xPostUrl, () => onXPostUrlChange(""))}
            onClick={() => clearForPaste(xPostUrl, () => onXPostUrlChange(""))}
            onFocus={() => clearForPaste(xPostUrl, () => onXPostUrlChange(""))}
            onChange={(event) => onXPostUrlChange(event.target.value)}
            placeholder="https://x.com/user/status/123…"
            className="field mt-2 text-sm"
            inputMode="url"
          />
        </label>

        <label className="block">
          <span className="label">Post copy / context</span>
          <textarea
            value={postContext}
            onPointerDown={() => clearForPaste(postContext, () => onPostContextChange(""))}
            onClick={() => clearForPaste(postContext, () => onPostContextChange(""))}
            onFocus={() => clearForPaste(postContext, () => onPostContextChange(""))}
            onChange={(event) => onPostContextChange(event.target.value)}
            placeholder="Paste the post, thread context, or screenshot text…"
            rows={5}
            className="field mt-2 resize-none leading-7"
          />
        </label>

        <div className="rounded-[1rem] border border-ivory/[0.08] bg-ivory/[0.025] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="label">Screenshot</p>
              <p className="mt-2 text-sm leading-6 text-stone-500">Use when the link or copy is not enough.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-gold/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gold transition hover:border-gold/45 hover:bg-gold/[0.07]">
              Upload
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => void handleScreenshotUpload(event.target.files?.[0])}
              />
            </label>
          </div>

          {screenshotError ? <p className="mt-3 text-sm text-red-100">{screenshotError}</p> : null}

          {screenshotDataUrl ? (
            <div className="mt-4 overflow-hidden rounded-[0.9rem] border border-ivory/[0.08] bg-[#050505]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={screenshotDataUrl} alt="Uploaded X post screenshot preview" className="max-h-56 w-full object-contain" />
              <div className="flex items-center justify-between gap-3 border-t border-ivory/[0.08] px-3 py-2 text-xs text-stone-500">
                <span className="truncate">{screenshotName || "Screenshot ready"}</span>
                <button type="button" onClick={clearScreenshot} className="font-semibold text-gold hover:text-ivory">
                  Remove
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <label className="block">
          <span className="label">Rough reply</span>
          <textarea
            value={roughReply}
            onPointerDown={() => clearForPaste(roughReply, () => onRoughReplyChange(""))}
            onClick={() => clearForPaste(roughReply, () => onRoughReplyChange(""))}
            onFocus={() => clearForPaste(roughReply, () => onRoughReplyChange(""))}
            onChange={(event) => onRoughReplyChange(event.target.value)}
            placeholder="Optional: paste your rough reply…"
            rows={3}
            className="field mt-2 resize-none leading-7"
          />
        </label>

        <IntentSelector
          intent={intent}
          voiceMode={voiceMode}
          onIntentChange={onIntentChange}
          onVoiceModeChange={onVoiceModeChange}
        />

        {error ? (
          <p className="rounded-[0.95rem] border border-red-300/20 bg-red-400/10 p-4 text-sm leading-6 text-red-100">{error}</p>
        ) : null}

        <button
          type="button"
          disabled={isLoading || !hasAnyContext}
          onClick={onSubmit}
          className="instrument-button mt-1 rounded-full px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-[#120f08] transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Sharpening signal…" : "Refine Reply"}
        </button>
      </div>
    </section>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image."));
    image.src = src;
  });
}

async function compressImageToDataUrl(file: File): Promise<string> {
  const original = await readFileAsDataUrl(file);
  if (original.length <= TARGET_DATA_URL_LENGTH) return original;

  const image = await loadImage(original);
  const maxSide = 1800;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext("2d");
  if (!context) return original;

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  for (const quality of [0.86, 0.78, 0.68, 0.58]) {
    const compressed = canvas.toDataURL("image/jpeg", quality);
    if (compressed.length <= TARGET_DATA_URL_LENGTH) return compressed;
  }

  return canvas.toDataURL("image/jpeg", 0.5);
}
