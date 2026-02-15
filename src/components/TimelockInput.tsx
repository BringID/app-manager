"use client";

import { formatTimelock } from "@/lib/utils/formatTimelock";

const PRESETS = [
  { label: "1 day", seconds: 86400 },
  { label: "1 week", seconds: 604800 },
  { label: "1 month", seconds: 2592000 },
  { label: "3 months", seconds: 7776000 },
  { label: "6 months", seconds: 15552000 },
  { label: "1 year", seconds: 31536000 },
  { label: "Disabled", seconds: 0 },
];

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
      <div className="mb-2 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onChange(String(preset.seconds))}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              numValue === preset.seconds
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
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
    </div>
  );
}
