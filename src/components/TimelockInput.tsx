"use client";

import { formatTimelock } from "@/lib/utils/formatTimelock";

type TimelockInputProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

export function TimelockInput({
  value,
  onChange,
  label = "Recovery Timelock (seconds)",
}: TimelockInputProps) {
  const numValue = Number(value) || 0;

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
        />
        <span className="shrink-0 text-sm text-zinc-400">
          {formatTimelock(numValue)}
        </span>
      </div>
      {numValue === 0 && (
        <p className="mt-1 text-xs text-zinc-500">
          0 = recovery disabled for this app
        </p>
      )}
    </div>
  );
}
