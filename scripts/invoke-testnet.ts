// Run 1 testnet invoke after deploy.
import { spawnSync } from "node:child_process";
spawnSync("bash", ["-lc", "~/.local/bin/soroban contract invoke --id $CONTRACT_ID --network testnet --source testnet-deployer -- lock"], { stdio: "inherit" });
