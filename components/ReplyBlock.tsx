"use client";

import { useState } from "react";
import type { ReplyVariant } from "@/lib/types";

type ReplyBlockProps = {
  title: string;
  reply: ReplyVariant;
};

export default function ReplyBlock({ title, reply }: ReplyBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(reply.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="rounded-[1.35rem] border border-gold/15 bg-black/25 p-4 shadow-lg shadow-black/20 transition hover:border-gold/30 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-ivory">{title}</h3>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-stone-400">
            {reply.characterCount} characters
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-gold/20 px-3 py-1.5 text-xs font-semibold text-gold transition hover:border-gold/45 hover:bg-gold/10"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="whitespace-pre-wrap text-[1.05rem] leading-7 text-ivory">{reply.text}</p>
      <p className="mt-4 border-t border-ivory/10 pt-3 text-sm leading-6 text-stone-400">{reply.whyItWorks}</p>
    </section>
  );
}
