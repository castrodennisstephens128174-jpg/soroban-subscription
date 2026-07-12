import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Angpao Subs Dapp",
  description: "angpao-subs-dapp — Soroban dApp built by Dat Quoc Tran",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <main className="max-w-2xl mx-auto p-6">
          <header className="mb-6">
            <h1 className="text-3xl font-bold">Angpao Subs Dapp</h1>
            <p className="text-slate-400 mt-1">Soroban dApp · Stellar {process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet"}</p>
            <p className="text-slate-500 text-sm mt-1">Built by Dat Quoc Tran · d23930249@gmail.com</p>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
