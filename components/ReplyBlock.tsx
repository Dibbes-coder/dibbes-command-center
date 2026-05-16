"use client";

import { useState } from "react";
import type { ReplyVariant } from "@/lib/types";

type ReplyBlockProps = {
  title: string;
  reply: ReplyVariant;
  featured?: boolean;
};

export default function ReplyBlock({ title, reply, featured = false }: ReplyBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(reply.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section
      className={[
        "group rounded-[1rem] border bg-black/20 p-4 transition hover:bg-ivory/[0.035]",
        featured ? "border-gold/25" : "border-ivory/[0.08] hover:border-gold/20",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-black uppercase tracking-[0.22em] text-gold/75">{title}</h3>
          <span className="text-[11px] text-stone-600">{reply.characterCount}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-ivory/10 px-3 py-1.5 text-xs font-semibold text-stone-300 transition hover:border-gold/35 hover:text-gold"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className={featured ? "whitespace-pre-wrap text-[1.12rem] leading-8 text-ivory" : "whitespace-pre-wrap text-[1rem] leading-7 text-ivory/95"}>
        {reply.text}
      </p>
      <p className="mt-3 border-t border-ivory/[0.07] pt-3 text-sm leading-6 text-stone-500">{reply.whyItWorks}</p>
    </section>
  );
}
