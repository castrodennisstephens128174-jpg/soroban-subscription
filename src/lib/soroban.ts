import {
  Keypair,
  TransactionBuilder,
  Networks,
  Server,
} from "@stellar/stellar-sdk";

const HORIZON_TESTNET = "https://horizon-testnet.stellar.org";

export async function buildInvokeContract({
  contractId,
  method,
  args = [],
  sponsorSecret,
}: {
  contractId: string;
  method: string;
  args?: any[];
  sponsorSecret: string;
}) {
  const sponsor = Keypair.fromSecret(sponsorSecret);
  const server = new Server(HORIZON_TESTNET);
  const account = await server.loadAccount(sponsor.publicKey());

  const tx = new TransactionBuilder(account, { fee: "1000000", networkPassphrase: Networks.TESTNET })
    .addOperation({
      type: "invokeHostFunction",
      function: "invokeContract",
      params: { contract_id: contractId, method, args },
      auth: [],
    } as any)
    .setTimeout(60)
    .build();

  return { xdr: tx.toXDR(), networkPassphrase: Networks.TESTNET };
}

export async function submitTx(signedXdr: string, networkPassphrase: string) {
  const { Transaction, Server } = await import("@stellar/stellar-sdk");
  const tx = Transaction.fromXDR(signedXdr, networkPassphrase);
  const server = new Server(HORIZON_TESTNET);
  const res = await server.submitTransaction(tx);
  return { hash: res.hash };
}

export async function signTransaction(xdr: string, opts: { networkPassphrase: string }) {
  const { signTransaction } = await import("@stellar/freighter-api");
  const { Transaction } = await import("@stellar/stellar-sdk");
  const tx = Transaction.fromXDR(xdr, opts.networkPassphrase);
  const txB64 = tx.toXDR();
  const sig = await signTransaction(txB64, { networkPassphrase: opts.networkPassphrase });
  return sig;
}
