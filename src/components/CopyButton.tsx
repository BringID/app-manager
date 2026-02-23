"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className={`shrink-0 rounded px-2 py-1 text-xs transition-colors ${
        copied
          ? "bg-green-700 text-green-100"
          : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
      }`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
