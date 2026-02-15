"use client";

import { formatTimelock } from "@/lib/utils/formatTimelock";

type ScoreRow = {
  groupId: bigint;
  status: number;
  validityDuration: bigint;
  familyId: bigint;
  defaultScore: bigint;
  customScore?: bigint;
};

type ScoreTableProps = {
  rows: ScoreRow[];
  showCustom?: boolean;
  editable?: boolean;
  editedScores?: Record<string, string>;
  onScoreChange?: (groupId: string, value: string) => void;
};

const GROUP_NAMES: Record<string, string> = {
  "1": "Farcaster (Low)",
  "2": "Farcaster (Medium)",
  "3": "Farcaster (High)",
  "4": "GitHub (Low)",
  "5": "GitHub (Medium)",
  "6": "GitHub (High)",
  "7": "X / Twitter (Low)",
  "8": "X / Twitter (Medium)",
  "9": "X / Twitter (High)",
  "10": "zkPassport",
  "11": "Self",
  "12": "Uber Rides",
  "13": "Apple Subs",
  "14": "Binance KYC",
  "15": "OKX KYC",
};

function getGroupName(groupId: bigint): string {
  return GROUP_NAMES[groupId.toString()] ?? `Group ${groupId.toString()}`;
}

export function ScoreTable({
  rows,
  showCustom = false,
  editable = false,
  editedScores,
  onScoreChange,
}: ScoreTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-400">
            <th className="pb-2 pr-4 font-medium">ID</th>
            <th className="pb-2 pr-4 font-medium">Credential</th>
            <th className="pb-2 pr-4 font-medium">Status</th>
            <th className="pb-2 pr-4 font-medium">Validity</th>
            <th className="pb-2 pr-4 font-medium">Default Score</th>
            {showCustom && (
              <th className="pb-2 font-medium">
                {editable ? "Custom Score (edit)" : "Custom Score"}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const gid = row.groupId.toString();
            return (
              <tr key={gid} className="border-b border-zinc-800/50">
                <td className="py-2.5 pr-4 font-mono text-white">{gid}</td>
                <td className="py-2.5 pr-4 text-zinc-300">
                  {getGroupName(row.groupId)}
                </td>
                <td className="py-2.5 pr-4">
                  <span
                    className={`text-xs ${
                      row.status === 1 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {row.status === 1 ? "Active" : "Suspended"}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-zinc-300">
                  {row.validityDuration > 0n
                    ? formatTimelock(Number(row.validityDuration))
                    : "No expiry"}
                </td>
                <td className="py-2.5 pr-4 font-mono text-zinc-300">
                  {row.defaultScore.toString()}
                </td>
                {showCustom && (
                  <td className="py-2.5">
                    {editable ? (
                      <input
                        type="number"
                        min="0"
                        value={editedScores?.[gid] ?? row.customScore?.toString() ?? "0"}
                        onChange={(e) => onScoreChange?.(gid, e.target.value)}
                        className="w-24 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-sm text-white focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <span className="font-mono text-zinc-300">
                        {row.customScore?.toString() ?? "—"}
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="py-8 text-center text-sm text-zinc-500">
          No credential groups found.
        </p>
      )}
    </div>
  );
}
