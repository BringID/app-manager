"use client";

import { isAddress } from "viem";

type AddressInputProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
};

export function AddressInput({
  value,
  onChange,
  label = "Address",
  placeholder = "0x...",
}: AddressInputProps) {
  const isValid = value === "" || isAddress(value);

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-zinc-900 px-3 py-2 font-mono text-sm text-white placeholder-zinc-500 focus:outline-none ${
          isValid
            ? "border-zinc-700 focus:border-blue-500"
            : "border-red-600 focus:border-red-500"
        }`}
      />
      {!isValid && (
        <p className="mt-1 text-xs text-red-400">Invalid Ethereum address</p>
      )}
    </div>
  );
}
