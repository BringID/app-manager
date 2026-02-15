"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { credentialRegistryAbi } from "@/lib/abi/CredentialRegistry";
import { defaultScorerAbi } from "@/lib/abi/DefaultScorer";
import {
  CREDENTIAL_REGISTRY_ADDRESS,
  DEFAULT_SCORER_ADDRESS,
} from "@/lib/contracts";
import { ScoreTable } from "@/components/ScoreTable";

export default function ScoreExplorerPage() {
  // Get all credential group IDs
  const { data: groupIds, isLoading: groupsLoading } = useReadContract({
    address: CREDENTIAL_REGISTRY_ADDRESS,
    abi: credentialRegistryAbi,
    functionName: "getCredentialGroupIds",
  });

  // Get default scores for all groups
  const { data: allScores, isLoading: scoresLoading } = useReadContract({
    address: DEFAULT_SCORER_ADDRESS,
    abi: defaultScorerAbi,
    functionName: "getAllScores",
  });

  // Get credential group details
  const groupDetailContracts = (groupIds ?? []).map((id) => ({
    address: CREDENTIAL_REGISTRY_ADDRESS as `0x${string}`,
    abi: credentialRegistryAbi,
    functionName: "credentialGroups" as const,
    args: [id] as const,
  }));

  const { data: groupDetails, isLoading: detailsLoading } = useReadContracts({
    contracts: groupDetailContracts,
  });

  const isLoading = groupsLoading || scoresLoading || detailsLoading;

  // Build score map from default scorer
  const scoreMap = new Map<string, bigint>();
  if (allScores) {
    const [ids, scores] = allScores;
    for (let i = 0; i < ids.length; i++) {
      scoreMap.set(ids[i].toString(), scores[i]);
    }
  }

  // Build rows
  const rows = (groupIds ?? []).map((id, i) => {
    const detail = groupDetails?.[i]?.result;
    return {
      groupId: id,
      semaphoreGroupId: detail ? (detail as [bigint, number])[0] : 0n,
      status: detail ? (detail as [bigint, number])[1] : 0,
      defaultScore: scoreMap.get(id.toString()) ?? 0n,
    };
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Score Explorer</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Read-only view of all credential groups and their default scores from the
        BringID DefaultScorer.
      </p>

      {isLoading ? (
        <div className="py-20 text-center text-zinc-400">Loading scores...</div>
      ) : (
        <ScoreTable rows={rows} />
      )}
    </div>
  );
}
