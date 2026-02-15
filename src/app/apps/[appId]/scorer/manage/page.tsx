"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { type Address } from "viem";
import Link from "next/link";
import { credentialRegistryAbi } from "@/lib/abi/CredentialRegistry";
import { defaultScorerAbi } from "@/lib/abi/DefaultScorer";
import {
  CREDENTIAL_REGISTRY_ADDRESS,
  DEFAULT_SCORER_ADDRESS,
} from "@/lib/contracts";
import { ScoreTable } from "@/components/ScoreTable";
import { TxButton } from "@/components/TxButton";

export default function ManageScorerPage() {
  const params = useParams();
  const appId = BigInt(params.appId as string);

  const [editedScores, setEditedScores] = useState<Record<string, string>>({});

  // Read app data to get scorer address
  const { data: appData } = useReadContract({
    address: CREDENTIAL_REGISTRY_ADDRESS,
    abi: credentialRegistryAbi,
    functionName: "apps",
    args: [appId],
  });

  const scorer = appData?.[3] as Address | undefined;
  const isDefaultScorer =
    scorer?.toLowerCase() === DEFAULT_SCORER_ADDRESS.toLowerCase();

  // Get credential group IDs
  const { data: groupIds } = useReadContract({
    address: CREDENTIAL_REGISTRY_ADDRESS,
    abi: credentialRegistryAbi,
    functionName: "getCredentialGroupIds",
  });

  // Get default scores
  const { data: defaultAllScores } = useReadContract({
    address: DEFAULT_SCORER_ADDRESS,
    abi: defaultScorerAbi,
    functionName: "getAllScores",
  });

  // Get custom scores from app's scorer
  const { data: customAllScores, refetch: refetchCustom } = useReadContract({
    address: scorer,
    abi: defaultScorerAbi,
    functionName: "getAllScores",
    query: { enabled: !!scorer && !isDefaultScorer },
  });

  // Get credential group details
  const groupDetailContracts = (groupIds ?? []).map((id) => ({
    address: CREDENTIAL_REGISTRY_ADDRESS as `0x${string}`,
    abi: credentialRegistryAbi,
    functionName: "credentialGroups" as const,
    args: [id] as const,
  }));

  const { data: groupDetails } = useReadContracts({
    contracts: groupDetailContracts,
  });

  // Batch update
  const batchWrite = useWriteContract();

  function handleBatchUpdate() {
    const entries = Object.entries(editedScores);
    if (entries.length === 0 || !scorer) return;

    const ids = entries.map(([id]) => BigInt(id));
    const scores = entries.map(([, s]) => BigInt(s || "0"));

    batchWrite.writeContract({
      address: scorer,
      abi: defaultScorerAbi,
      functionName: "setScores",
      args: [ids, scores],
    });
  }

  // Build score maps
  const defaultScoreMap = new Map<string, bigint>();
  if (defaultAllScores) {
    const [ids, scores] = defaultAllScores;
    for (let i = 0; i < ids.length; i++) {
      defaultScoreMap.set(ids[i].toString(), scores[i]);
    }
  }

  const customScoreMap = new Map<string, bigint>();
  if (customAllScores) {
    const [ids, scores] = customAllScores;
    for (let i = 0; i < ids.length; i++) {
      customScoreMap.set(ids[i].toString(), scores[i]);
    }
  }

  const rows = (groupIds ?? []).map((id, i) => {
    const detail = groupDetails?.[i]?.result as [number, bigint, bigint] | undefined;
    return {
      groupId: id,
      status: detail ? detail[0] : 0,
      validityDuration: detail ? detail[1] : 0n,
      familyId: detail ? detail[2] : 0n,
      defaultScore: defaultScoreMap.get(id.toString()) ?? 0n,
      customScore: customScoreMap.get(id.toString()) ?? 0n,
    };
  });

  const hasChanges = Object.keys(editedScores).length > 0;

  if (isDefaultScorer) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <p className="mb-4 text-zinc-400">
          This app uses the Default Scorer (read-only). Deploy a custom scorer
          to edit scores.
        </p>
        <Link
          href={`/apps/${appId.toString()}/scorer/deploy`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Deploy Custom Scorer
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link
          href={`/apps/${appId.toString()}`}
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← Back to App #{appId.toString()}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Manage Custom Scores</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Edit scores on your custom scorer. Default scores shown for reference.
        </p>
        {scorer && (
          <p className="mt-1 font-mono text-xs text-zinc-500">
            Scorer: {scorer}
          </p>
        )}
      </div>

      <ScoreTable
        rows={rows}
        showCustom
        editable
        editedScores={editedScores}
        onScoreChange={(gid, val) =>
          setEditedScores((prev) => ({ ...prev, [gid]: val }))
        }
      />

      <div className="mt-6 flex items-center gap-4">
        <TxButton
          label={`Save ${Object.keys(editedScores).length} Score(s)`}
          onClick={handleBatchUpdate}
          txHash={batchWrite.data}
          isPending={batchWrite.isPending}
          error={batchWrite.error}
          disabled={!hasChanges}
          onSuccess={() => {
            setEditedScores({});
            refetchCustom();
          }}
        />
        {hasChanges && (
          <button
            onClick={() => setEditedScores({})}
            className="text-sm text-zinc-400 hover:text-white"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
