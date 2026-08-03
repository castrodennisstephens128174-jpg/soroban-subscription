"use client";
import { useState } from "react";

export function CopyContractId({ contractId }: { contractId: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(contractId);
      setCopied(true);
      setError(null);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Clipboard unavailable");
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <p className="font-mono text-xs break-all flex-1">{contractId}</p>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy contract ID"
        className="text-xs text-slate-300 hover:text-white border border-slate-600 rounded px-2 py-1"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  );
}