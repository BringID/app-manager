"use client";

import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { type Address } from "viem";
import { credentialRegistryAbi } from "@/lib/abi/CredentialRegistry";
import { CREDENTIAL_REGISTRY_ADDRESS, AppStatus } from "@/lib/contracts";

export type AppInfo = {
  appId: bigint;
  status: AppStatus;
  recoveryTimelock: bigint;
  admin: Address;
  scorer: Address;
};

export function useMyApps() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address || !publicClient) {
      setApps([]);
      return;
    }

    let cancelled = false;

    async function fetchApps() {
      setIsLoading(true);
      setError(null);
      try {
        // Get apps created by this address
        const registeredLogs = await publicClient!.getLogs({
          address: CREDENTIAL_REGISTRY_ADDRESS,
          event: {
            type: "event",
            name: "AppRegistered",
            inputs: [
              { name: "appId", type: "uint256", indexed: true },
              { name: "admin", type: "address", indexed: true },
              { name: "recoveryTimelock", type: "uint256", indexed: false },
            ],
          },
          args: { admin: address },
          fromBlock: 0n,
          toBlock: "latest",
        });

        // Get apps transferred TO this address
        const transferredInLogs = await publicClient!.getLogs({
          address: CREDENTIAL_REGISTRY_ADDRESS,
          event: {
            type: "event",
            name: "AppAdminTransferred",
            inputs: [
              { name: "appId", type: "uint256", indexed: true },
              { name: "oldAdmin", type: "address", indexed: true },
              { name: "newAdmin", type: "address", indexed: true },
            ],
          },
          args: { newAdmin: address },
          fromBlock: 0n,
          toBlock: "latest",
        });

        if (cancelled) return;

        // Collect candidate app IDs
        const appIdSet = new Set<bigint>();
        for (const log of registeredLogs) {
          if (log.args.appId !== undefined) appIdSet.add(log.args.appId);
        }
        for (const log of transferredInLogs) {
          if (log.args.appId !== undefined) appIdSet.add(log.args.appId);
        }

        // Verify current admin on-chain and build app list
        const results: AppInfo[] = [];
        for (const appId of appIdSet) {
          const data = await publicClient!.readContract({
            address: CREDENTIAL_REGISTRY_ADDRESS,
            abi: credentialRegistryAbi,
            functionName: "apps",
            args: [appId],
          });

          const [status, recoveryTimelock, admin, scorer] = data;
          if (admin.toLowerCase() === address!.toLowerCase()) {
            results.push({
              appId,
              status: status as AppStatus,
              recoveryTimelock,
              admin,
              scorer,
            });
          }
        }

        if (!cancelled) {
          results.sort((a, b) => Number(a.appId - b.appId));
          setApps(results);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchApps();
    return () => {
      cancelled = true;
    };
  }, [address, publicClient]);

  return { apps, isLoading, error, refetch: () => {} };
}
