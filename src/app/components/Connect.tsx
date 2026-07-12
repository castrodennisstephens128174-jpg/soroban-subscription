"use client";
import { useEffect, useState } from "react";

export function Connect() {
  const [pubKey, setPubKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setLoading(true); setError(null);
    try {
      const { requestAccess } = await import("@stellar/freighter-api");
      const result = await requestAccess();
      if (result.error) throw new Error(result.error);
      setPubKey(result.address);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const { isConnected } = await import("@stellar/freighter-api");
        const { isConnected: connected } = await isConnected();
        if (connected) connect();
      } catch {}
    })();
  }, []);

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-2">Wallet</h2>
      {pubKey ? (
        <div>
          <p className="text-emerald-400 text-sm font-mono break-all">{pubKey}</p>
          <p className="text-slate-400 text-xs mt-1">Connected via Freighter</p>
        </div>
      ) : (
        <button className="btn" onClick={connect} disabled={loading}>
          {loading ? "Connecting…" : "Connect Freighter"}
        </button>
      )}
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
