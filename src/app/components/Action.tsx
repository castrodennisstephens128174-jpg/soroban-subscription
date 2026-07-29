"use client";
import { useEffect, useState } from "react";

export function Action({ contractId, action }: { contractId: string; action: "lock" | "release" | "refund" }) {
  const [status, setStatus] = useState<"idle" | "building" | "signing" | "submitted" | "error">("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status !== "submitted" && status !== "error") return;
    const timer = setTimeout(() => {
      setStatus("idle");
      setError(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [status]);

  async function copyHash() {
    if (!txHash) return;
    try {
      await navigator.clipboard.writeText(txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Clipboard unavailable in this browser");
    }
  }

  async function run() {
    setStatus("building"); setError(null); setTxHash(null);
    try {
      const { signTransaction, submitTx } = await import("@/lib/soroban");
      const { xdr, networkPassphrase } = await buildOp(contractId, action);
      setStatus("signing");
      const signed = await signTransaction(xdr, { networkPassphrase });
      if (signed.error) throw new Error(signed.error);
      setStatus("submitted");
      const { hash } = await submitTx(signed.signedTxXdr, networkPassphrase);
      setTxHash(hash);
    } catch (e) {
      const raw = (e as Error).message || String(e);
      const friendly = /fetch|network|ENOTFOUND|ETIMEDOUT|horizon/i.test(raw)
        ? "Network unreachable — check your connection to Stellar testnet"
        : raw;
      setError(friendly);
      setStatus("error");
    }
  }

  return (
    <div className="card flex flex-col gap-2">
      <button className="btn" onClick={run} disabled={status === "building" || status === "signing"}>
        {status === "idle" && `Run ${action}`}
        {status === "building" && "Building…"}
        {status === "signing" && "Sign in Freighter…"}
        {status === "submitted" && "Submitted ✓"}
        {status === "error" && "Retry"}
      </button>
      {txHash && (
        <div className="flex items-center gap-2">
          <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noreferrer" className="text-emerald-400 text-xs font-mono break-all flex-1">
            {txHash} ↗
          </a>
          <button
            type="button"
            onClick={copyHash}
            aria-label="Copy transaction hash"
            className="text-xs text-slate-300 hover:text-white border border-slate-600 rounded px-2 py-1"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

async function buildOp(contractId: string, action: "lock" | "release" | "refund") {
  const { Server, Keypair, TransactionBuilder, Operation, Asset, Networks } = await import("@stellar/stellar-sdk");
  const horizon = "https://horizon-testnet.stellar.org";
  const networkPassphrase = Networks.TESTNET;
  const server = new Server(horizon);

  const secret = process.env.NEXT_PUBLIC_SPONSOR_SECRET;
  if (!secret) throw new Error("NEXT_PUBLIC_SPONSOR_SECRET not set in .env.local");
  const sponsor = (await import("@stellar/stellar-sdk")).Keypair.fromSecret(secret);
  const account = await server.loadAccount(sponsor.publicKey());

  const op = action === "lock"
    ? Operation.invokeHostFunction({
        hostFunction: { name: "invokeContract", args: [contractId, "lock", [], []] },
        auth: [],
      })
    : Operation.invokeHostFunction({
        hostFunction: { name: "invokeContract", args: [contractId, action, [], []] },
        auth: [],
      });

  const tx = new TransactionBuilder(account, { fee: "1000000", networkPassphrase })
    .addOperation(op)
    .setTimeout(60)
    .build();

  return { xdr: tx.toXDR(), networkPassphrase, sponsor };
}
