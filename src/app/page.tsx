"use client";
import { useState } from "react";
import { Connect } from "./components/Connect";
import { CopyContractId } from "./components/CopyContractId";
import { Action } from "./components/Action";

export default function Home() {
  const [pubKey, setPubKey] = useState<string | null>(null);
  return (
    <>
      <section>
        <Connect onConnect={setPubKey} />
      </section>
      <section className="grid md:grid-cols-3 gap-4">
        {(["lock", "release", "refund"] as const).map((a) => (
          <Action key={a} action={a} contractId={process.env.NEXT_PUBLIC_CONTRACT_ID ?? "CAPPYPLACEHOLDER"} walletReady={Boolean(pubKey)} />
        ))}
      </section>
      <section className="card mt-6">
        <h2 className="text-xl font-semibold">Contract</h2>
        <p className="text-slate-400 text-sm mt-1">Soroban escrow on Stellar {process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet"}</p>
        <CopyContractId contractId={process.env.NEXT_PUBLIC_CONTRACT_ID ?? "CAPPYPLACEHOLDER"} />
      </section>
    </>
  );
}