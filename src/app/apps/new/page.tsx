"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { decodeEventLog } from "viem";
import Link from "next/link";
import { credentialRegistryAbi } from "@/lib/abi/CredentialRegistry";
import { CREDENTIAL_REGISTRY_ADDRESS } from "@/lib/contracts";
import { formatAppId } from "@/lib/utils/formatAppId";
import { TimelockInput } from "@/components/TimelockInput";
import { TxButton } from "@/components/TxButton";

export default function RegisterAppPage() {
  const [timelock, setTimelock] = useState("0");
  const [registeredAppId, setRegisteredAppId] = useState<bigint | null>(null);

  const { writeContract, data: txHash, isPending, error, reset } = useWriteContract();

  const { data: receipt } = useWaitForTransactionReceipt({ hash: txHash });

  // Extract appId from receipt when available
  if (receipt && !registeredAppId) {
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: credentialRegistryAbi,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === "AppRegistered") {
          setRegisteredAppId((decoded.args as { appId: bigint }).appId);
          break;
        }
      } catch {
        // not our event
      }
    }
  }

  function handleRegister() {
    writeContract({
      address: CREDENTIAL_REGISTRY_ADDRESS,
      abi: credentialRegistryAbi,
      functionName: "registerApp",
      args: [BigInt(timelock || "0")],
    });
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold">Register New App</h1>

      {registeredAppId !== null ? (
        <div className="rounded-lg border border-green-800 bg-green-950/50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-green-400">
            App Registered!
          </h2>
          <p className="mb-2 text-zinc-300">
            Your App ID is{" "}
            <span className="font-mono text-lg font-bold text-white">
              {formatAppId(registeredAppId)}
            </span>
          </p>
          <div className="mb-4 flex items-center gap-2">
            <code className="rounded bg-zinc-800 px-2 py-1 font-mono text-xs text-zinc-400 break-all">
              {registeredAppId.toString()}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(registeredAppId.toString())}
              className="shrink-0 rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-600"
            >
              Copy
            </button>
          </div>
          <p className="mb-4 text-sm text-zinc-400">
            Save this ID — you&apos;ll need it to manage your app.
          </p>
          <div className="flex gap-3">
            <Link
              href={`/apps/${registeredAppId.toString()}`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to App Settings
            </Link>
            <button
              onClick={() => {
                setRegisteredAppId(null);
                reset();
              }}
              className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600"
            >
              Register Another
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <p className="text-sm text-zinc-400">
            Register a new app on the BringID CredentialRegistry. Your connected
            wallet will become the app admin.
          </p>

          <TimelockInput value={timelock} onChange={setTimelock} />

          <TxButton
            label="Register App"
            onClick={handleRegister}
            txHash={txHash}
            isPending={isPending}
            error={error}
          />
        </div>
      )}
    </div>
  );
}
