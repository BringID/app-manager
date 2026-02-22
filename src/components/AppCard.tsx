import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { formatTimelock } from "@/lib/utils/formatTimelock";
import { formatAppId } from "@/lib/utils/formatAppId";
import { type AppInfo } from "@/lib/hooks/useMyApps";
import { DEFAULT_SCORER_ADDRESS } from "@/lib/contracts";

export function AppCard({ app }: { app: AppInfo }) {
  const isDefault =
    app.scorer.toLowerCase() === DEFAULT_SCORER_ADDRESS.toLowerCase();

  return (
    <Link
      href={`/apps/${app.appId.toString()}`}
      className="block rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-lg font-bold text-white" title={app.appId.toString()}>
          App {formatAppId(app.appId)}
        </span>
        <StatusBadge status={app.status} />
      </div>
      <div className="space-y-1.5 text-sm text-zinc-400">
        <div className="flex justify-between">
          <span>Scorer</span>
          <span className="font-mono text-zinc-300">
            {isDefault ? "Default (BringID)" : `${app.scorer.slice(0, 6)}...${app.scorer.slice(-4)}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Recovery Timelock</span>
          <span className="text-zinc-300">
            {formatTimelock(Number(app.recoveryTimelock))}
          </span>
        </div>
      </div>
    </Link>
  );
}
