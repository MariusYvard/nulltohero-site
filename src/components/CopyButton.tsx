"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy command"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        });
      }}
      className={`min-h-12 shrink-0 border-l border-line px-4 font-mono text-sm font-bold transition-colors ${
        copied ? "bg-green text-paper" : "bg-white/5 text-ink hover:bg-white/10"
      }`}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
