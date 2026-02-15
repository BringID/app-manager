"use client";

import { useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { getUserFriendlyError } from "@/lib/utils/errorMessages";

type TxButtonProps = {
  label: string;
  onClick: () => void;
  txHash?: `0x${string}`;
  isPending: boolean;
  error: Error | null;
  onSuccess?: (receipt: { transactionHash: `0x${string}`; logs: readonly { topics: readonly string[]; data: string }[] }) => void;
  disabled?: boolean;
  variant?: "primary" | "danger" | "secondary";
  className?: string;
};

const VARIANT_STYLES = {
  primary:
    "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white",
  danger:
    "bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white",
  secondary:
    "bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-700/50 text-white",
};

export function TxButton({
  label,
  onClick,
  txHash,
  isPending,
  error,
  onSuccess,
  disabled,
  variant = "primary",
  className = "",
}: TxButtonProps) {
  const { data: receipt, isLoading: isConfirming } =
    useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (receipt && onSuccess) {
      onSuccess(receipt as never);
    }
  }, [receipt, onSuccess]);

  const isDisabled = disabled || isPending || isConfirming;

  const buttonLabel = isPending
    ? "Confirm in wallet..."
    : isConfirming
      ? "Confirming..."
      : receipt && txHash
        ? "Confirmed!"
        : label;

  return (
    <div className={className}>
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_STYLES[variant]}`}
      >
        {buttonLabel}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-400">
          {getUserFriendlyError(error)}
        </p>
      )}
      {receipt && txHash && (
        <p className="mt-2 text-sm text-green-400">
          Transaction confirmed.
        </p>
      )}
    </div>
  );
}
