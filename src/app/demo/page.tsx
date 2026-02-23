"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useAccount, useChainId, useSignMessage } from "wagmi";
import { baseSepolia, base } from "wagmi/chains";
import { BringID } from "bringid";
import { ethers } from "ethers";
import { useMyApps } from "@/lib/hooks/useMyApps";
import { formatAppId } from "@/lib/utils/formatAppId";

const BringIDModal = dynamic(
  () => import("bringid/react").then((m) => m.BringIDModal),
  { ssr: false },
);

// BringID's own app IDs (hash-based, per chain)
const BRINGID_APP_IDS: Record<number, bigint> = {
  [base.id]: 73594675973776425610572226910366728313584340544029116170588881424777663153321n,
  [baseSepolia.id]: 111616409347612400399828768160239566106801356577601241664476007206550967737659n,
};

export default function DemoPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-zinc-400">Loading...</div>}>
      <DemoPageContent />
    </Suspense>
  );
}

function DemoPageContent() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const searchParams = useSearchParams();
  const { apps, isLoading: appsLoading } = useMyApps();

  const mode = chainId === baseSepolia.id ? "dev" : "production";

  const bringIdAppId = BRINGID_APP_IDS[chainId] ?? BRINGID_APP_IDS[base.id];

  // App selection — default to query param or BringID's own app
  const [appId, setAppId] = useState(
    searchParams.get("appId") || bringIdAppId.toString(),
  );

  // SDK ref
  const sdkRef = useRef<BringID | null>(null);

  // verifyHumanity state
  const [humanityResult, setHumanityResult] = useState<{
    points: number;
    proofs: unknown[];
  } | null>(null);
  const [humanityLoading, setHumanityLoading] = useState(false);
  const [humanityError, setHumanityError] = useState("");

  // verifyProofs state
  const [proofsResult, setProofsResult] = useState<{
    verified: boolean;
    score: { total: number; groups: { credential_group_id: string; score: number }[] };
  } | null>(null);
  const [proofsLoading, setProofsLoading] = useState(false);
  const [proofsError, setProofsError] = useState("");

  // Collapsible JSON
  const [showProofsJson, setShowProofsJson] = useState(false);

  // Initialize / recreate SDK when appId or mode changes
  useEffect(() => {
    if (sdkRef.current) {
      sdkRef.current.destroy();
      sdkRef.current = null;
    }

    if (appId) {
      sdkRef.current = new BringID({ appId, mode });
    }

    return () => {
      if (sdkRef.current) {
        sdkRef.current.destroy();
        sdkRef.current = null;
      }
    };
  }, [appId, mode]);

  // Reset results when appId changes
  useEffect(() => {
    setHumanityResult(null);
    setHumanityError("");
    setProofsResult(null);
    setProofsError("");
    setShowProofsJson(false);
  }, [appId]);

  const generateSignature = useCallback(
    async (msg: string) => {
      return signMessageAsync({ message: msg });
    },
    [signMessageAsync],
  );

  // --- Handlers ---

  async function handleVerifyHumanity() {
    if (!sdkRef.current) return;
    setHumanityLoading(true);
    setHumanityError("");
    setHumanityResult(null);
    try {
      const result = await sdkRef.current.verifyHumanity();
      setHumanityResult({ points: result.points, proofs: result.proofs });
    } catch (err) {
      setHumanityError(err instanceof Error ? err.message : String(err));
    } finally {
      setHumanityLoading(false);
    }
  }

  async function handleVerifyProofs() {
    if (!sdkRef.current || !humanityResult?.proofs) return;
    setProofsLoading(true);
    setProofsError("");
    setProofsResult(null);
    try {
      const provider = new ethers.JsonRpcProvider(
        chainId === baseSepolia.id
          ? `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
          : `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
      );
      const result = await sdkRef.current.verifyProofs({
        proofs: humanityResult.proofs as Parameters<BringID["verifyProofs"]>[0]["proofs"],
        provider,
      });
      setProofsResult(result);
    } catch (err) {
      setProofsError(err instanceof Error ? err.message : String(err));
    } finally {
      setProofsLoading(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">SDK Demo</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Test the BringID SDK integration with one of your registered apps.
      </p>

      {/* Configuration */}
      <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 text-lg font-semibold">Configuration</h2>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-zinc-400">App</label>
          <select
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value={bringIdAppId.toString()}>
              App {formatAppId(bringIdAppId)} (BringID)
            </option>
            {appsLoading ? (
              <option disabled>Loading your apps...</option>
            ) : (
              apps.filter((app) => app.appId !== bringIdAppId).map((app) => (
                <option key={app.appId.toString()} value={app.appId.toString()}>
                  App {formatAppId(app.appId)}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-400">
            Mode:{" "}
            <span className={mode === "dev" ? "text-yellow-400" : "text-green-400"}>
              {mode}
            </span>
          </span>
          <span className="text-zinc-400">
            SDK: {appId ? <span className="text-green-400">initialized</span> : <span className="text-zinc-500">waiting for App ID</span>}
          </span>
        </div>
      </div>

      {/* BringIDModal — only rendered when appId is set and wallet connected */}
      {appId && address && (
        <BringIDModal
          address={address}
          generateSignature={generateSignature}
          theme="dark"
          highlightColor="#3b82f6"
        />
      )}

      {/* verifyHumanity */}
      <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 text-lg font-semibold">verifyHumanity</h2>

        <button
          onClick={handleVerifyHumanity}
          disabled={!appId || !address || humanityLoading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {humanityLoading ? "Verifying..." : "Verify Humanity"}
        </button>

        {!address && (
          <p className="mt-2 text-sm text-zinc-500">Connect wallet to verify.</p>
        )}

        {humanityResult && (
          <div className="mt-4 rounded-md bg-zinc-800 p-4">
            <p className="mb-2 text-sm text-zinc-400">
              Points: <span className="text-lg font-bold text-white">{humanityResult.points}</span>
            </p>
            <p className="mb-2 text-sm text-zinc-400">
              Proofs: {humanityResult.proofs.length} credential group(s)
            </p>
            <button
              onClick={() => setShowProofsJson(!showProofsJson)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {showProofsJson ? "Hide" : "Show"} raw proofs
            </button>
            {showProofsJson && (
              <pre className="mt-2 max-h-64 overflow-auto rounded bg-zinc-900 p-3 text-xs text-zinc-300">
                {JSON.stringify(humanityResult.proofs, null, 2)}
              </pre>
            )}
          </div>
        )}

        {humanityError && (
          <p className="mt-4 text-sm text-red-400">{humanityError}</p>
        )}
      </div>

      {/* verifyProofs */}
      <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 text-lg font-semibold">verifyProofs</h2>

        <button
          onClick={handleVerifyProofs}
          disabled={!humanityResult?.proofs || proofsLoading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {proofsLoading ? "Verifying..." : "Verify On-Chain"}
        </button>

        {!humanityResult && (
          <p className="mt-2 text-sm text-zinc-500">
            Complete humanity verification first.
          </p>
        )}

        {proofsResult && (
          <div className="mt-4 rounded-md bg-zinc-800 p-4">
            <p className="mb-2 text-sm text-zinc-400">
              Verified:{" "}
              <span className={`font-bold ${proofsResult.verified ? "text-green-400" : "text-red-400"}`}>
                {proofsResult.verified ? "Yes" : "No"}
              </span>
            </p>
            <p className="mb-2 text-sm text-zinc-400">
              Total Score: <span className="text-lg font-bold text-white">{proofsResult.score.total}</span>
            </p>
            {proofsResult.score.groups.length > 0 && (
              <div className="mt-2">
                <p className="mb-1 text-sm text-zinc-400">Score Breakdown:</p>
                <div className="space-y-1">
                  {proofsResult.score.groups.map((g) => (
                    <div key={g.credential_group_id} className="flex justify-between text-sm">
                      <span className="text-zinc-300">Group {g.credential_group_id}</span>
                      <span className="text-white">{g.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {proofsError && (
          <p className="mt-4 text-sm text-red-400">{proofsError}</p>
        )}
      </div>
    </div>
  );
}
