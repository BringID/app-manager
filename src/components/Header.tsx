"use client";

import { useState, useRef, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";

const CHAINS = [
  { id: base.id, name: "Base", color: "#3b82f6" },
  { id: baseSepolia.id, name: "Base Sepolia", color: "#eab308" },
];

const VALID_CHAIN_IDS = new Set(CHAINS.map((c) => c.id));

function getChainIdParam(): number | null {
  if (typeof window === "undefined") return null;
  const param = new URLSearchParams(window.location.search).get("chainId");
  if (!param) return null;
  const id = Number(param);
  return VALID_CHAIN_IDS.has(id) ? id : null;
}

/** Remove chainId from the URL without a page reload. */
function clearChainIdParam() {
  const url = new URL(window.location.href);
  url.searchParams.delete("chainId");
  window.history.replaceState({}, "", url.pathname + url.search);
}

function NetworkSwitcher() {
  const activeId = useChainId();
  const { chainId: walletChainId, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const urlChainId = useRef(getChainIdParam());

  const active = CHAINS.find((c) => c.id === activeId) ?? CHAINS[0];

  // Switch chain from ?chainId= URL param
  useEffect(() => {
    const target = urlChainId.current;
    if (!target) return;
    const mismatch =
      activeId !== target ||
      (isConnected && walletChainId !== target);
    if (!mismatch) return;

    const timer = setTimeout(() => {
      switchChainAsync({ chainId: target }).catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [activeId, walletChainId, isConnected, switchChainAsync]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
      >
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: active.color }}
        />
        {active.name}
        <svg className="h-3 w-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
          {CHAINS.map((chain) => (
            <button
              key={chain.id}
              onClick={() => {
                if (chain.id !== activeId) {
                  urlChainId.current = null;
                  clearChainIdParam();
                  switchChainAsync({ chainId: chain.id }).catch(() => {});
                }
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                chain.id === activeId
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: chain.color }}
              />
              {chain.name}
              {chain.id === activeId && (
                <svg className="ml-auto h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const NAV_ITEMS = [
  { href: "/apps", label: "My Apps" },
  { href: "/apps/new", label: "Register App" },
  { href: "/scores", label: "Score Explorer" },
  { href: "/demo", label: "Demo" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeChainId = useChainId();
  const isTestnet = activeChainId === baseSepolia.id;

  return (
    <>
    {isTestnet && (
      <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-1.5 text-center text-xs font-medium text-yellow-400">
        Testnet Mode — You are on Base Sepolia
      </div>
    )}
    <header className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/apps" className="text-lg font-bold text-white">
            BringID
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <NetworkSwitcher />
          <ConnectButton
            chainStatus="none"
            showBalance={false}
            accountStatus="address"
          />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-2 text-zinc-400 hover:text-white sm:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav className="border-t border-zinc-800 px-4 pb-3 sm:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                pathname === item.href
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
    </>
  );
}
