// Auto-deploy contract to Stellar testnet via soroban-cli.
// Run: bun scripts/deploy-testnet.ts
// Pre-req: cargo install --locked --git https://github.com/stellar/rs-soroban-sdk soroban-cli --root ./target-tools
//
import { spawnSync } from "node:child_process";

const WASM = "contracts/target/wasm32-unknown-unknown/release/angpao_subs_dapp.wasm";
const RES = spawnSync("bash", ["-lc", "cd contracts && cargo build --target wasm32-unknown-unknown --release 2>&1 | tail -3"], { encoding: "utf-8" });
console.log(RES.stdout);

const RES2 = spawnSync("bash", ["-lc", `~/.local/bin/soroban contract deploy --wasm ${WASM} --network testnet --source testnet-deployer`], { encoding: "utf-8" });
console.log(RES2.stdout);
