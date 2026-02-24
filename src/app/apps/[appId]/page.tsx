"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  useReadContract,
  useWriteContract,
  useAccount,
} from "wagmi";
import { isAddress, type Address } from "viem";
import Link from "next/link";
import { credentialRegistryAbi } from "@/lib/abi/CredentialRegistry";
import {
  CREDENTIAL_REGISTRY_ADDRESS,
  AppStatus,
} from "@/lib/contracts";
import { formatTimelock } from "@/lib/utils/formatTimelock";
import { formatAppId, fullHexId } from "@/lib/utils/formatAppId";
import { StatusBadge } from "@/components/StatusBadge";
import { TxButton } from "@/components/TxButton";
import { TimelockInput } from "@/components/TimelockInput";
import { AddressInput } from "@/components/AddressInput";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CopyButton } from "@/components/CopyButton";

export default function AppDetailPage() {
  const params = useParams();
  const appId = BigInt(params.appId as string);
  const { address } = useAccount();

  // Read app data
  const {
    data: appData,
    isLoading,
    refetch,
  } = useReadContract({
    address: CREDENTIAL_REGISTRY_ADDRESS,
    abi: credentialRegistryAbi,
    functionName: "apps",
    args: [appId],
  });

  // Read default scorer address
  const { data: defaultScorerAddr } = useReadContract({
    address: CREDENTIAL_REGISTRY_ADDRESS,
    abi: credentialRegistryAbi,
    functionName: "defaultScorer",
  });

  // Read pending admin
  const { data: pendingAdmin, refetch: refetchPending } = useReadContract({
    address: CREDENTIAL_REGISTRY_ADDRESS,
    abi: credentialRegistryAbi,
    functionName: "pendingAppAdmin",
    args: [appId],
  });


  const [status, recoveryTimelock, admin, scorer] = appData ?? [
    0, 0n, "0x0" as Address, "0x0" as Address,
  ];

  const isAdmin =
    address && admin && address.toLowerCase() === (admin as string).toLowerCase();

  const hasPendingAdmin =
    pendingAdmin &&
    pendingAdmin !== "0x0000000000000000000000000000000000000000";

  const isPendingAdmin =
    hasPendingAdmin &&
    address &&
    (pendingAdmin as string).toLowerCase() === address.toLowerCase();

  // --- Status Section ---
  const statusWrite = useWriteContract();

  function handleToggleStatus() {
    if (status === AppStatus.ACTIVE) {
      statusWrite.writeContract({
        address: CREDENTIAL_REGISTRY_ADDRESS,
        abi: credentialRegistryAbi,
        functionName: "suspendApp",
        args: [appId],
      });
    } else {
      statusWrite.writeContract({
        address: CREDENTIAL_REGISTRY_ADDRESS,
        abi: credentialRegistryAbi,
        functionName: "activateApp",
        args: [appId],
      });
    }
  }

  // --- Timelock Section ---
  const [newTimelock, setNewTimelock] = useState("");
  const timelockWrite = useWriteContract();

  function handleSetTimelock() {
    timelockWrite.writeContract({
      address: CREDENTIAL_REGISTRY_ADDRESS,
      abi: credentialRegistryAbi,
      functionName: "setAppRecoveryTimelock",
      args: [appId, BigInt(newTimelock || "0")],
    });
  }

  // --- Admin Transfer Section ---
  const [newAdmin, setNewAdmin] = useState("");
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);
  const adminWrite = useWriteContract();

  function handleAdminTransfer() {
    setShowAdminConfirm(false);
    adminWrite.writeContract({
      address: CREDENTIAL_REGISTRY_ADDRESS,
      abi: credentialRegistryAbi,
      functionName: "transferAppAdmin",
      args: [appId, newAdmin as Address],
    });
  }

  // --- Accept Admin Transfer ---
  const acceptWrite = useWriteContract();

  function handleAcceptAdmin() {
    acceptWrite.writeContract({
      address: CREDENTIAL_REGISTRY_ADDRESS,
      abi: credentialRegistryAbi,
      functionName: "acceptAppAdmin",
      args: [appId],
    });
  }


  // --- Scorer Section ---
  const [customScorer, setCustomScorer] = useState("");
  const [showAdvancedScorer, setShowAdvancedScorer] = useState(false);
  const [scorerValidation, setScorerValidation] = useState<string | null>(null);
  const scorerWrite = useWriteContract();

  const isDefaultScorer =
    defaultScorerAddr &&
    scorer &&
    (scorer as string).toLowerCase() === (defaultScorerAddr as string).toLowerCase();

  function handleUseDefaultScorer() {
    scorerWrite.writeContract({
      address: CREDENTIAL_REGISTRY_ADDRESS,
      abi: credentialRegistryAbi,
      functionName: "setAppScorer",
      args: [appId, defaultScorerAddr as Address],
    });
  }

  function handleUseCustomScorer() {
    if (!isAddress(customScorer)) {
      setScorerValidation("Invalid address");
      return;
    }
    setScorerValidation(null);
    scorerWrite.writeContract({
      address: CREDENTIAL_REGISTRY_ADDRESS,
      abi: credentialRegistryAbi,
      functionName: "setAppScorer",
      args: [appId, customScorer as Address],
    });
  }

  const handleRefetch = useCallback(() => {
    refetch();
    refetchPending();
  }, [refetch, refetchPending]);


  if (isLoading) {
    return <div className="py-20 text-center text-zinc-400">Loading app...</div>;
  }

  if (!appData || admin === "0x0000000000000000000000000000000000000000") {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-400">App {formatAppId(appId)} not found.</p>
        <p className="mt-1 font-mono text-xs text-zinc-600">{fullHexId(appId)}</p>
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">App {formatAppId(appId)}</h1>
            <StatusBadge status={status as AppStatus} />
          </div>
          <p className="mt-1 font-mono text-xs text-zinc-500">{fullHexId(appId)}</p>
        </div>
        <Link
          href="/apps"
          className="text-sm text-zinc-400 hover:text-white"
        >
          Back to My Apps
        </Link>
      </div>

      {!isAdmin && !isPendingAdmin && (
        <div className="mb-6 rounded-lg border border-yellow-800 bg-yellow-950/50 p-4 text-sm text-yellow-400">
          You are not the admin of this app. Admin actions are disabled.
        </div>
      )}

      {isPendingAdmin && (
        <div className="mb-6 rounded-lg border border-blue-800 bg-blue-950/50 p-4">
          <p className="mb-3 text-sm text-blue-400">
            You have a pending admin transfer for this app.
          </p>
          <TxButton
            label="Accept Admin Transfer"
            variant="secondary"
            onClick={handleAcceptAdmin}
            txHash={acceptWrite.data}
            isPending={acceptWrite.isPending}
            error={acceptWrite.error}
            onSuccess={handleRefetch}
          />
        </div>
      )}

      <div className="space-y-6">
        {/* App ID Section */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold">App ID</h2>
          <div className="flex items-center gap-2">
            <code className="rounded bg-zinc-800 px-2 py-1 font-mono text-xs text-zinc-400 break-all">
              {fullHexId(appId)}
            </code>
            <CopyButton value={fullHexId(appId)} />
          </div>
        </section>

        {/* Scoring Section */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold">Scoring</h2>
          <p className="mb-4 text-sm text-zinc-400">
            Current scorer:{" "}
            <span className="font-mono text-zinc-300">
              {isDefaultScorer
                ? "Default (BringID)"
                : `${(scorer as string).slice(0, 6)}...${(scorer as string).slice(-4)}`}
            </span>
            {!isDefaultScorer && (
              <span className="ml-2 font-mono text-xs text-zinc-500">
                {scorer as string}
              </span>
            )}
          </p>

          <div className="space-y-4">
            {isDefaultScorer ? (
              <Link
                href={`/apps/${fullHexId(appId)}/scorer/deploy`}
                className="inline-block rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600"
              >
                Set Custom Scores
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href={`/apps/${fullHexId(appId)}/scorer/manage`}
                  className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Manage Scores
                </Link>
                <TxButton
                  label="Use Default Scorer"
                  variant="secondary"
                  onClick={handleUseDefaultScorer}
                  txHash={scorerWrite.data}
                  isPending={scorerWrite.isPending}
                  error={scorerWrite.error}
                  disabled={!isAdmin}
                  onSuccess={handleRefetch}
                />
              </div>
            )}

            <div className="border-t border-zinc-800 pt-4">
              <button
                onClick={() => setShowAdvancedScorer(!showAdvancedScorer)}
                className="text-sm text-zinc-500 hover:text-zinc-300"
              >
                Use a custom scoring contract. (Advanced) {showAdvancedScorer ? "▲" : "▼"}
              </button>
              {showAdvancedScorer && (
                <div className="mt-3 space-y-3">
                  <AddressInput
                    value={customScorer}
                    onChange={(v) => {
                      setCustomScorer(v);
                      setScorerValidation(null);
                    }}
                    label="Custom Scorer Address"
                  />
                  {scorerValidation && (
                    <p className="text-sm text-red-400">{scorerValidation}</p>
                  )}
                  <TxButton
                    label="Set Custom Scorer"
                    variant="secondary"
                    onClick={handleUseCustomScorer}
                    txHash={isDefaultScorer ? scorerWrite.data : undefined}
                    isPending={scorerWrite.isPending}
                    error={scorerWrite.error}
                    disabled={!isAdmin || !customScorer}
                    onSuccess={handleRefetch}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Timelock Section */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold">Recovery Timelock</h2>
          <p className="mb-4 text-sm text-zinc-400">
            The recovery timelock is a delay period that protects your app from unauthorized admin changes.
            If your admin key is compromised, this delay gives you time to intervene before changes take effect.
          </p>
          <p className="mb-4 text-sm text-zinc-400">
            Current: <span className="text-white">{formatTimelock(Number(recoveryTimelock))}</span>
            {recoveryTimelock > 0n && (
              <span className="text-zinc-500"> ({recoveryTimelock.toString()}s)</span>
            )}
          </p>
          <div className="space-y-3">
            <TimelockInput
              value={newTimelock}
              onChange={setNewTimelock}
              label="New Timelock (seconds)"
            />
            <TxButton
              label="Update Timelock"
              variant="secondary"
              onClick={handleSetTimelock}
              txHash={timelockWrite.data}
              isPending={timelockWrite.isPending}
              error={timelockWrite.error}
              disabled={!isAdmin || !newTimelock}
              onSuccess={handleRefetch}
            />
          </div>
        </section>

        {/* Danger Zone */}
        <section className="rounded-lg border border-red-900/50 bg-zinc-900/50">
          <h2 className="border-b border-red-900/50 px-6 py-4 text-lg font-semibold text-red-400">Danger Zone</h2>

          <div className="border-b border-red-900/30 px-6 py-4">
            <div>
              <h3 className="text-base font-semibold">Suspend this app</h3>
              <p className="mb-3 text-sm text-zinc-400">
                Blocks all new registrations and proof generation. You can re-activate at any time.
              </p>
            </div>
            <TxButton
              label={status === AppStatus.ACTIVE ? "Suspend App" : "Activate App"}
              variant="secondary"
              onClick={handleToggleStatus}
              txHash={statusWrite.data}
              isPending={statusWrite.isPending}
              error={statusWrite.error}
              disabled={!isAdmin}
              onSuccess={handleRefetch}
            />
          </div>

          <div className="px-6 py-4">
            <div>
              <h3 className="text-base font-semibold">Transfer admin</h3>
              <p className="mb-1 text-sm text-zinc-400">
                The new admin must accept before it takes effect.
              </p>
              <p className="mb-3 text-xs text-zinc-500">
                Current admin: <span className="font-mono text-zinc-400">{admin as string}</span>
              </p>
            </div>

            {hasPendingAdmin && (
              <div className="mb-3 rounded-md border border-blue-800 bg-blue-950/30 p-3 text-xs text-blue-400">
                Pending transfer to:{" "}
                <span className="font-mono">{pendingAdmin as string}</span>{" "}
                (awaiting acceptance)
              </div>
            )}

            <div className="space-y-3">
              <AddressInput
                value={newAdmin}
                onChange={setNewAdmin}
                label="New Admin Address"
              />
              <TxButton
                label="Transfer Admin"
                variant="danger"
                onClick={() => setShowAdminConfirm(true)}
                txHash={adminWrite.data}
                isPending={adminWrite.isPending}
                error={adminWrite.error}
                disabled={!isAdmin || !isAddress(newAdmin)}
                onSuccess={handleRefetch}
              />
            </div>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={showAdminConfirm}
        title="Transfer Admin?"
        message={`You are about to initiate an admin transfer of App ${formatAppId(appId)} to ${newAdmin}. The new admin must accept the transfer before it takes effect.`}
        confirmLabel="Transfer Admin"
        onConfirm={handleAdminTransfer}
        onCancel={() => setShowAdminConfirm(false)}
      />
    </div>
  );
}
