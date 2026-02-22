"use client";

import { useAccount, useWriteContract } from "wagmi";
import Link from "next/link";
import { useMyApps } from "@/lib/hooks/useMyApps";
import { usePendingTransfers } from "@/lib/hooks/usePendingTransfers";
import { AppCard } from "@/components/AppCard";
import { credentialRegistryAbi } from "@/lib/abi/CredentialRegistry";
import { CREDENTIAL_REGISTRY_ADDRESS } from "@/lib/contracts";
import { formatAppId } from "@/lib/utils/formatAppId";
import { TxButton } from "@/components/TxButton";

function PendingTransferCard({
  appId,
  currentAdmin,
  onSuccess,
}: {
  appId: bigint;
  currentAdmin: string;
  onSuccess: () => void;
}) {
  const acceptWrite = useWriteContract();

  function handleAccept() {
    acceptWrite.writeContract({
      address: CREDENTIAL_REGISTRY_ADDRESS,
      abi: credentialRegistryAbi,
      functionName: "acceptAppAdmin",
      args: [appId],
    });
  }

  return (
    <div className="rounded-lg border border-blue-800 bg-blue-950/30 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono font-bold text-white" title={appId.toString()}>
          App {formatAppId(appId)}
        </span>
      </div>
      <p className="mb-3 text-sm text-zinc-400">
        From: <span className="font-mono text-zinc-300">{currentAdmin}</span>
      </p>
      <TxButton
        label="Accept Transfer"
        onClick={handleAccept}
        txHash={acceptWrite.data}
        isPending={acceptWrite.isPending}
        error={acceptWrite.error}
        onSuccess={onSuccess}
      />
    </div>
  );
}

export default function MyAppsPage() {
  const { address } = useAccount();
  const { apps, isLoading, error } = useMyApps();
  const {
    transfers,
    isLoading: transfersLoading,
    refetch: refetchTransfers,
  } = usePendingTransfers();

  if (!address) {
    return (
      <div className="py-20 text-center">
        <h1 className="mb-2 text-2xl font-bold">My Apps</h1>
        <p className="text-zinc-400">Connect your wallet to view your apps.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Apps</h1>
        <Link
          href="/apps/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Register App
        </Link>
      </div>

      {/* Pending Transfers */}
      {!transfersLoading && transfers.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-blue-400">
            Pending Transfers
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {transfers.map((t) => (
              <PendingTransferCard
                key={t.appId.toString()}
                appId={t.appId}
                currentAdmin={t.currentAdmin}
                onSuccess={refetchTransfers}
              />
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center text-zinc-400">
          Loading your apps...
        </div>
      ) : error ? (
        <div className="py-20 text-center text-red-400">
          Failed to load apps: {error.message}
        </div>
      ) : apps.length === 0 ? (
        <div className="py-20 text-center">
          <p className="mb-4 text-zinc-400">
            You don&apos;t have any apps yet.
          </p>
          <Link
            href="/apps/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Register Your First App
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <AppCard key={app.appId.toString()} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}
