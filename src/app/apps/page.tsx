"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { useMyApps } from "@/lib/hooks/useMyApps";
import { AppCard } from "@/components/AppCard";

export default function MyAppsPage() {
  const { address } = useAccount();
  const { apps, isLoading, error } = useMyApps();

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
