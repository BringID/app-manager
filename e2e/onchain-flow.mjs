/**
 * On-chain flow: Register App → Deploy Custom Scorer → Set Scores
 * Uses viem directly against Base Sepolia contracts.
 */
import {
  createPublicClient,
  createWalletClient,
  http,
  decodeEventLog,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { writeFileSync } from "fs";

const PRIVATE_KEY = process.env.E2E_PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error("ERROR: Set E2E_PRIVATE_KEY in .env.local");
  process.exit(1);
}

const CREDENTIAL_REGISTRY = "0xbF9b2556e6Dd64D60E08E3669CeF2a4293e006db";
const SCORER_FACTORY = "0xAa03996D720C162Fdff246E1D3CEecc792986750";

// ── Inline ABIs (only the functions/events we need) ──

const registryAbi = [
  {
    type: "function",
    name: "registerApp",
    inputs: [{ name: "recoveryTimelock_", type: "uint256" }],
    outputs: [{ name: "appId_", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setAppScorer",
    inputs: [
      { name: "appId_", type: "uint256" },
      { name: "scorer_", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "apps",
    inputs: [{ name: "appId", type: "uint256" }],
    outputs: [
      { name: "status", type: "uint8" },
      { name: "recoveryTimelock", type: "uint256" },
      { name: "admin", type: "address" },
      { name: "scorer", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "AppRegistered",
    inputs: [
      { name: "appId", type: "uint256", indexed: true },
      { name: "admin", type: "address", indexed: true },
      { name: "recoveryTimelock", type: "uint256", indexed: false },
    ],
  },
];

const scorerFactoryAbi = [
  {
    type: "function",
    name: "create",
    inputs: [],
    outputs: [{ name: "scorer", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "ScorerCreated",
    inputs: [
      { name: "scorer", type: "address", indexed: true },
      { name: "owner", type: "address", indexed: true },
    ],
  },
];

const defaultScorerAbi = [
  {
    type: "function",
    name: "getAllScores",
    inputs: [],
    outputs: [
      { name: "credentialGroupIds_", type: "uint256[]" },
      { name: "scores_", type: "uint256[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setScores",
    inputs: [
      { name: "credentialGroupIds_", type: "uint256[]" },
      { name: "scores_", type: "uint256[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

// ── Setup ──

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http("https://sepolia.base.org"),
});

const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http("https://sepolia.base.org"),
});

console.log(`Wallet: ${account.address}`);
const balance = await publicClient.getBalance({ address: account.address });
console.log(`Balance: ${(Number(balance) / 1e18).toFixed(6)} ETH\n`);

if (balance === 0n) {
  console.error(
    "ERROR: Wallet has no ETH! Fund it from a Base Sepolia faucet."
  );
  process.exit(1);
}

// ── Step 1: Register App ──
console.log("=== Step 1: Register App ===");
const timelockSeconds = 86400n; // 1 day
console.log(`Timelock: ${timelockSeconds}s (1 day)`);

const registerHash = await walletClient.writeContract({
  address: CREDENTIAL_REGISTRY,
  abi: registryAbi,
  functionName: "registerApp",
  args: [timelockSeconds],
});
console.log(`Tx sent: ${registerHash}`);
console.log("Waiting for confirmation...");

const registerReceipt = await publicClient.waitForTransactionReceipt({
  hash: registerHash,
});
console.log(`Confirmed! Status: ${registerReceipt.status}`);

let appId;
for (const log of registerReceipt.logs) {
  try {
    const decoded = decodeEventLog({
      abi: registryAbi,
      data: log.data,
      topics: log.topics,
    });
    if (decoded.eventName === "AppRegistered") {
      appId = decoded.args.appId;
    }
  } catch {}
}
console.log(`→ App ID: ${appId}\n`);

// ── Step 2: Deploy Custom Scorer ──
console.log("=== Step 2: Deploy Custom Scorer ===");
const deployHash = await walletClient.writeContract({
  address: SCORER_FACTORY,
  abi: scorerFactoryAbi,
  functionName: "create",
});
console.log(`Tx sent: ${deployHash}`);
console.log("Waiting for confirmation...");

const deployReceipt = await publicClient.waitForTransactionReceipt({
  hash: deployHash,
});
console.log(`Confirmed! Status: ${deployReceipt.status}`);

let scorerAddress;
for (const log of deployReceipt.logs) {
  try {
    const decoded = decodeEventLog({
      abi: scorerFactoryAbi,
      data: log.data,
      topics: log.topics,
    });
    if (decoded.eventName === "ScorerCreated") {
      scorerAddress = decoded.args.scorer;
    }
  } catch {}
}
console.log(`→ Scorer: ${scorerAddress}\n`);

// ── Step 3: Wire Scorer to App ──
console.log("=== Step 3: Set Scorer on App ===");
const setScorerHash = await walletClient.writeContract({
  address: CREDENTIAL_REGISTRY,
  abi: registryAbi,
  functionName: "setAppScorer",
  args: [appId, scorerAddress],
});
console.log(`Tx sent: ${setScorerHash}`);
console.log("Waiting for confirmation...");

const setScorerReceipt = await publicClient.waitForTransactionReceipt({
  hash: setScorerHash,
});
console.log(`Confirmed! Status: ${setScorerReceipt.status}\n`);

// ── Step 4: Set Custom Scores ──
console.log("=== Step 4: Set Custom Scores ===");
const groupIds = [1n, 2n, 3n];
const scores = [100n, 200n, 150n];
console.log(
  `Scores: ${groupIds.map((g, i) => `Group ${g} = ${scores[i]}`).join(", ")}`
);

const setScoresHash = await walletClient.writeContract({
  address: scorerAddress,
  abi: defaultScorerAbi,
  functionName: "setScores",
  args: [groupIds, scores],
});
console.log(`Tx sent: ${setScoresHash}`);
console.log("Waiting for confirmation...");

const setScoresReceipt = await publicClient.waitForTransactionReceipt({
  hash: setScoresHash,
});
console.log(`Confirmed! Status: ${setScoresReceipt.status}\n`);

// ── Verify ──
console.log("=== Verification ===");
const appData = await publicClient.readContract({
  address: CREDENTIAL_REGISTRY,
  abi: registryAbi,
  functionName: "apps",
  args: [appId],
});
console.log(`App #${appId}:`);
console.log(`  Admin:    ${appData[2]}`);
console.log(`  Status:   ${appData[0]} (1=Active)`);
console.log(`  Timelock: ${appData[1]}s`);
console.log(`  Scorer:   ${appData[3]}`);

const allScores = await publicClient.readContract({
  address: scorerAddress,
  abi: defaultScorerAbi,
  functionName: "getAllScores",
});
const [ids, vals] = allScores;
console.log(`\nCustom scorer scores (non-zero):`);
for (let i = 0; i < ids.length; i++) {
  if (vals[i] > 0n) {
    console.log(`  Group ${ids[i]}: ${vals[i]}`);
  }
}

// Save results for screenshot script
writeFileSync(
  new URL("./flow-results.json", import.meta.url),
  JSON.stringify(
    { appId: appId.toString(), scorerAddress },
    null,
    2
  )
);
console.log("\n✓ Results saved to e2e/flow-results.json");
