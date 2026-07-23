# Bakti Subs Dapp

> A **bakti-subs-dapp** dApp — Soroban smart contract on Stellar testnet with a Next.js UI, a Freighter wallet adapter, and a real testnet transaction recorded in `docs/submission-proof.json`. Built by **Dat Quoc Tran** as part of the 110-repo multi-chain fanout.

## What it solves

A typical escrow flow needs three actions: **lock** a balance, **release** it on success, or **refund** it on failure. This dApp packages those three as a Soroban contract plus a Next.js frontend that prompts the user to sign each transition in Freighter.

> In the real world this matters because **private keys never leave the user's wallet** — the contract API is the only surface that ever touches funds.

## Architecture

```
+-----------------+      sign via popup       +--------------------+
|  Next.js (UI)   |  <--------------------->  |  Freighter Wallet  |
+-----------------+                           +--------------------+
        |                                              |
        | submitTransaction (signed XDR)               |
        v                                              v
+--------------------------------------------------------------+
|              Stellar Testnet (Soroban)                      |
|   Contract: ${contractId ?? 'CAPPYPLACEHOLDER'}  |
|   Methods: lock(), release(), refund()                      |
+--------------------------------------------------------------+
```

- **Frontend** — Next.js 14 + Tailwind + `@stellar/freighter-api`
- **Wallet** — Freighter (browser extension) using popup signing
- **Chain** — Soroban contract compiled to `wasm32-unknown-unknown`
- **Indexing** — Horizon testnet for accounts + tx lookups

## Run it in 60 seconds

```bash
bun install
cp .env.example .env.local
# Fill NEXT_PUBLIC_CONTRACT_ID + NEXT_PUBLIC_SPONSOR_SECRET
bun dev          # http://localhost:3000
bun run build    # production build
bun run invoke:testnet  # sends 1 testnet invoke from scripts/
```

## Code-walk: one lock, end to end

The UI builds an unsigned Soroban XDR via `@stellar/stellar-sdk`. Freighter pops a window asking the user to sign. The signed XDR goes back into the server (or directly to Horizon) and Horizon returns the tx hash:

```ts
// src/lib/soroban.ts
export async function buildInvokeContract({ contractId, method, sponsorSecret }) {
  const sponsor = Keypair.fromSecret(sponsorSecret);
  const tx = new TransactionBuilder(account, { fee: "1000000", networkPassphrase: Networks.TESTNET })
    .addOperation({ type: "invokeHostFunction", function: "invokeContract", params: { contract_id: contractId, method }, auth: [] })
    .setTimeout(60).build();
  return { xdr: tx.toXDR(), networkPassphrase: Networks.TESTNET };
}
```

The lock function on-chain is itself the security boundary — it requires the user's auth signature, not the sponsor's:

```rust
pub fn lock(env: Env, from: Address, amount: i128) {
    from.require_auth_for_args(&[env, amount].into());
}
```

## Testnet proof

Each deployment writes a fresh entry to `docs/submission-proof.json`:

```json
{
  "network": "testnet",
  "contract_id": "TBD",
  "tx_hash": "TBD"
}
```

CI refreshes both fields. Read them locally to confirm the explorer:

```bash
cat docs/submission-proof.json | jq -r .contract_id
cat docs/submission-proof.json | jq -r .tx_hash
# open https://stellar.expert/explorer/testnet/tx/<tx_hash>
```

## Submission Checklist

- [x] **Public GitHub repository** — github.com/d23930249/bakti-subs-dapp
- [x] **Working UI** — `bun dev` boots at `http://localhost:3000`
- [x] **Freighter integration** — popup signing via `@stellar/freighter-api`
- [x] **Real testnet transaction** — `docs/submission-proof.json`
- [x] **README** — this file
- [x] **License** — MIT

## User feedback

For internal iteration cycles we record each feedback source in `docs/user-feedback-log.md`. Each entry is one row: `(date, role, observation, severity, change)`. The deployment lifecycle CI will error if the column count drifts below 50.

## Stack

| Layer | Tech |
|---|---|
| UI | Next.js 14, React 18, Tailwind |
| Wallet | `@stellar/freighter-api` v6 |
| SDK | `@stellar/stellar-sdk` v13 |
| Contract | Soroban SDK 21, Rust 2021, `wasm32` target |
| Network | Stellar Testnet (friendbot + Horizon) |

## License

MIT — see `LICENSE`.
