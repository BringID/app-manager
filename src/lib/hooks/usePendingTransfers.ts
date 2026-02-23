"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { type Address } from "viem";
import { credentialRegistryAbi } from "@/lib/abi/CredentialRegistry";
import { CREDENTIAL_REGISTRY_ADDRESS } from "@/lib/contracts";

export type PendingTransfer = {
  appId: bigint;
  currentAdmin: Address;
};

export function usePendingTransfers() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [transfers, setTransfers] = useState<PendingTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fetchCount, setFetchCount] = useState(0);

  const refetch = useCallback(() => {
    setFetchCount((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!address || !publicClient) {
      setTransfers([]);
      return;
    }

    let cancelled = false;

    async function fetchPending() {
      setIsLoading(true);
      setError(null);
      try {
        // Get transfer-initiated events where this address is the new admin
        const logs = await publicClient!.getLogs({
          address: CREDENTIAL_REGISTRY_ADDRESS,
          event: {
            type: "event",
            name: "AppAdminTransferInitiated",
            inputs: [
              { name: "appId", type: "uint256", indexed: true },
              { name: "currentAdmin", type: "address", indexed: true },
              { name: "newAdmin", type: "address", indexed: true },
            ],
          },
          args: { newAdmin: address },
          fromBlock: 0n,
          toBlock: "latest",
        });

        if (cancelled) return;

        // Verify each is still pending on-chain
        const results: PendingTransfer[] = [];
        const seen = new Set<string>();

        for (const log of logs) {
          const appId = log.args.appId;
          const currentAdmin = log.args.currentAdmin;
          if (appId === undefined || !currentAdmin) continue;

          const key = appId.toString();
          if (seen.has(key)) continue;
          seen.add(key);

          const pending = await publicClient!.readContract({
            address: CREDENTIAL_REGISTRY_ADDRESS,
            abi: credentialRegistryAbi,
            functionName: "pendingAppAdmin",
            args: [appId],
          });

          if (
            (pending as string).toLowerCase() === address!.toLowerCase()
          ) {
            results.push({ appId, currentAdmin });
          }
        }

        if (!cancelled) {
          setTransfers(results);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchPending();
    return () => {
      cancelled = true;
    };
  }, [address, publicClient, fetchCount]);

  return { transfers, isLoading, error, refetch };
}
