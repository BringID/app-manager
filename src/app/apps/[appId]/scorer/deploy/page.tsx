"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  usePublicClient,
} from "wagmi";
import { decodeEventLog, type Address } from "viem";
import Link from "next/link";
import { scorerFactoryAbi } from "@/lib/abi/ScorerFactory";
import { credentialRegistryAbi } from "@/lib/abi/CredentialRegistry";
import {
  SCORER_FACTORY_ADDRESS,
  CREDENTIAL_REGISTRY_ADDRESS,
} from "@/lib/contracts";
import { formatAppId } from "@/lib/utils/formatAppId";
import { TxButton } from "@/components/TxButton";

export default function DeployScorerPage() {
  const params = useParams();
  const router = useRouter();
  const appId = BigInt(params.appId as string);
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [newScorerAddress, setNewScorerAddress] = useState<Address | null>(null);
  const [existingScorers, setExistingScorers] = useState<Address[]>([]);

  // Step 1: Deploy scorer via factory
  const deployWrite = useWriteContract();
  const { data: deployReceipt } = useWaitForTransactionReceipt({
    hash: deployWrite.data,
  });

  // Step 2: Set scorer on app
  const setScorerWrite = useWriteContract();
  const { data: setScorerReceipt } = useWaitForTransactionReceipt({
    hash: setScorerWrite.data,
  });

  // Check for existing scorers created by this address
  useEffect(() => {
    if (!address || !publicClient) return;

    publicClient
      .getLogs({
        address: SCORER_FACTORY_ADDRESS,
        event: {
          type: "event",
          name: "ScorerCreated",
          inputs: [
            { name: "scorer", type: "address", indexed: true },
            { name: "owner", type: "address", indexed: true },
          ],
        },
        args: { owner: address },
        fromBlock: 0n,
        toBlock: "latest",
      })
      .then((logs) => {
        const addrs = logs
          .map((l) => l.args.scorer)
          .filter((a): a is Address => !!a);
        setExistingScorers(addrs);
      })
      .catch(() => {});
  }, [address, publicClient]);

  // Extract deployed scorer address from receipt
  useEffect(() => {
    if (!deployReceipt || newScorerAddress) return;

    for (const log of deployReceipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: scorerFactoryAbi,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === "ScorerCreated") {
          const addr = (decoded.args as { scorer: Address }).scorer;
          setNewScorerAddress(addr);
          setStep(2);
          break;
        }
      } catch {
        // not our event
      }
    }
  }, [deployReceipt, newScorerAddress]);

  // Auto-proceed to step 3 after setAppScorer confirms
  useEffect(() => {
    if (setScorerReceipt && step === 2) {
      setStep(3);
    }
  }, [setScorerReceipt, step]);

  function handleDeploy() {
    deployWrite.writeContract({
      address: SCORER_FACTORY_ADDRESS,
      abi: scorerFactoryAbi,
      functionName: "create",
    });
  }

  function handleSetScorer(addr: Address) {
    setScorerWrite.writeContract({
      address: CREDENTIAL_REGISTRY_ADDRESS,
      abi: credentialRegistryAbi,
      functionName: "setAppScorer",
      args: [appId, addr],
    });
  }

  function handleReuseScorer(addr: Address) {
    setNewScorerAddress(addr);
    setStep(2);
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <Link
          href={`/apps/${appId.toString()}`}
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← Back to App {formatAppId(appId)}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Deploy Custom Scorer</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Deploy a new DefaultScorer instance owned by your wallet via
          ScorerFactory, then wire it to your app.
        </p>
      </div>

      {/* Step indicators */}
      <div className="mb-6 flex gap-4">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex items-center gap-2 text-sm ${
              step >= s ? "text-white" : "text-zinc-600"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step > s
                  ? "bg-green-600 text-white"
                  : step === s
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {step > s ? "✓" : s}
            </span>
            {s === 1 ? "Deploy" : s === 2 ? "Set Scorer" : "Done"}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {/* Step 1: Deploy */}
        <section
          className={`rounded-lg border p-6 ${
            step === 1
              ? "border-blue-800 bg-zinc-900/50"
              : "border-zinc-800 bg-zinc-900/30 opacity-60"
          }`}
        >
          <h2 className="mb-3 text-lg font-semibold">
            Step 1: Deploy Scorer
          </h2>
          <p className="mb-4 text-sm text-zinc-400">
            Deploys a new DefaultScorer contract. You will be the owner and can
            set custom scores.
          </p>

          {existingScorers.length > 0 && step === 1 && (
            <div className="mb-4 rounded-md border border-zinc-700 bg-zinc-800/50 p-3">
              <p className="mb-2 text-xs font-medium text-zinc-300">
                You already have {existingScorers.length} deployed scorer(s):
              </p>
              {existingScorers.map((addr) => (
                <div key={addr} className="flex items-center justify-between py-1">
                  <span className="font-mono text-xs text-zinc-400">
                    {addr.slice(0, 10)}...{addr.slice(-8)}
                  </span>
                  <button
                    onClick={() => handleReuseScorer(addr)}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Reuse
                  </button>
                </div>
              ))}
            </div>
          )}

          {step === 1 && (
            <TxButton
              label="Deploy New Scorer"
              onClick={handleDeploy}
              txHash={deployWrite.data}
              isPending={deployWrite.isPending}
              error={deployWrite.error}
            />
          )}
        </section>

        {/* Step 2: Set Scorer on App */}
        <section
          className={`rounded-lg border p-6 ${
            step === 2
              ? "border-blue-800 bg-zinc-900/50"
              : "border-zinc-800 bg-zinc-900/30 opacity-60"
          }`}
        >
          <h2 className="mb-3 text-lg font-semibold">
            Step 2: Set as App Scorer
          </h2>
          {newScorerAddress && (
            <p className="mb-4 text-sm text-zinc-400">
              Scorer deployed at{" "}
              <span className="font-mono text-zinc-300">
                {newScorerAddress}
              </span>
            </p>
          )}
          {step === 2 && newScorerAddress && (
            <TxButton
              label="Set App Scorer"
              onClick={() => handleSetScorer(newScorerAddress)}
              txHash={setScorerWrite.data}
              isPending={setScorerWrite.isPending}
              error={setScorerWrite.error}
            />
          )}
        </section>

        {/* Step 3: Done */}
        {step === 3 && (
          <section className="rounded-lg border border-green-800 bg-green-950/50 p-6">
            <h2 className="mb-2 text-lg font-semibold text-green-400">
              Custom Scorer Set!
            </h2>
            <p className="mb-4 text-sm text-zinc-300">
              Your app is now using a custom scorer. Set initial scores to
              customize scoring.
            </p>
            <button
              onClick={() =>
                router.push(`/apps/${appId.toString()}/scorer/manage`)
              }
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Manage Scores →
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
