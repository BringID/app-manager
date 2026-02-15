"use client";

type ScoreRow = {
  groupId: bigint;
  status: number;
  semaphoreGroupId: bigint;
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
            <th className="pb-2 pr-4 font-medium">Group ID</th>
            <th className="pb-2 pr-4 font-medium">Status</th>
            <th className="pb-2 pr-4 font-medium">Semaphore Group</th>
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
                <td className="py-2.5 pr-4">
                  <span
                    className={`text-xs ${
                      row.status === 1 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {row.status === 1 ? "Active" : "Suspended"}
                  </span>
                </td>
                <td className="py-2.5 pr-4 font-mono text-zinc-300">
                  {row.semaphoreGroupId.toString()}
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
