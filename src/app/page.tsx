import { Connect } from "./components/Connect";
import { Action } from "./components/Action";

export default function Home() {
  const contractId = process.env.NEXT_PUBLIC_CONTRACT_ID ?? "CAPPYPLACEHOLDER";
  return (
    <>
      <section>
        <Connect />
      </section>
      <section className="grid md:grid-cols-3 gap-4">
        {(["lock", "release", "refund"] as const).map((a) => (
          <Action key={a} action={a} contractId={contractId} />
        ))}
      </section>
      <section className="card mt-6">
        <h2 className="text-xl font-semibold">Contract</h2>
        <p className="text-slate-400 text-sm mt-1">Soroban escrow on Stellar {process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet"}</p>
        <p className="font-mono text-xs break-all mt-2">{contractId}</p>
      </section>
    </>
  );
}
