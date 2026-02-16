"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
  DEFAULT_SCORER_ADDRESS,
  AppStatus,
} from "@/lib/contracts";
import { formatTimelock } from "@/lib/utils/formatTimelock";
import { StatusBadge } from "@/components/StatusBadge";
import { TxButton } from "@/components/TxButton";
import { TimelockInput } from "@/components/TimelockInput";
import { AddressInput } from "@/components/AddressInput";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function AppDetailPage() {
  const params = useParams();
  const router = useRouter();
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

  const [status, recoveryTimelock, admin, scorer] = appData ?? [
    0, 0n, "0x0" as Address, "0x0" as Address,
  ];

  const isAdmin =
    address && admin && address.toLowerCase() === (admin as string).toLowerCase();

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
      functionName: "setAppAdmin",
      args: [appId, newAdmin as Address],
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
  }, [refetch]);

  if (isLoading) {
    return <div className="py-20 text-center text-zinc-400">Loading app...</div>;
  }

  if (!appData || admin === "0x0000000000000000000000000000000000000000") {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-400">App #{appId.toString()} not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">App #{appId.toString()}</h1>
          <StatusBadge status={status as AppStatus} />
        </div>
        <Link
          href="/apps"
          className="text-sm text-zinc-400 hover:text-white"
        >
          Back to My Apps
        </Link>
      </div>

      {!isAdmin && (
        <div className="mb-6 rounded-lg border border-yellow-800 bg-yellow-950/50 p-4 text-sm text-yellow-400">
          You are not the admin of this app. Admin actions are disabled.
        </div>
      )}

      <div className="space-y-6">
        {/* Status Section */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold">Status</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">
                Current status: <StatusBadge status={status as AppStatus} />
              </p>
            </div>
            <TxButton
              label={status === AppStatus.ACTIVE ? "Suspend App" : "Activate App"}
              variant={status === AppStatus.ACTIVE ? "danger" : "primary"}
              onClick={handleToggleStatus}
              txHash={statusWrite.data}
              isPending={statusWrite.isPending}
              error={statusWrite.error}
              disabled={!isAdmin}
              onSuccess={handleRefetch}
            />
          </div>
        </section>

        {/* Timelock Section */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold">Recovery Timelock</h2>
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
              onClick={handleSetTimelock}
              txHash={timelockWrite.data}
              isPending={timelockWrite.isPending}
              error={timelockWrite.error}
              disabled={!isAdmin || !newTimelock}
              onSuccess={handleRefetch}
            />
          </div>
        </section>

        {/* Admin Transfer Section */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold">Admin Transfer</h2>
          <p className="mb-2 text-sm text-zinc-400">
            Current admin:{" "}
            <span className="font-mono text-zinc-300">
              {admin as string}
            </span>
          </p>
          <div className="mb-4 rounded-md border border-yellow-800 bg-yellow-950/30 p-3 text-xs text-yellow-400">
            Warning: This is irreversible. You will lose admin access to this
            app.
          </div>
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
              onSuccess={() => router.push("/apps")}
            />
          </div>
        </section>

        {/* Scorer Section */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold">Scorer Configuration</h2>
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
                href={`/apps/${appId.toString()}/scorer/deploy`}
                className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Set Custom Scores →
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href={`/apps/${appId.toString()}/scorer/manage`}
                  className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Manage Scores →
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
      </div>

      <ConfirmDialog
        open={showAdminConfirm}
        title="Transfer Admin?"
        message={`You are about to transfer admin of App #${appId.toString()} to ${newAdmin}. This action is irreversible — you will lose all admin access.`}
        confirmLabel="Transfer Admin"
        onConfirm={handleAdminTransfer}
        onCancel={() => setShowAdminConfirm(false)}
      />
    </div>
  );
}
