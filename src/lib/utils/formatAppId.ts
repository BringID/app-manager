/** Convert a bigint app ID to a 0x-prefixed, zero-padded 64-char hex string. */
export function toHex(appId: bigint): string {
  return "0x" + appId.toString(16).padStart(64, "0");
}

/** Full hex string for display (e.g. in code blocks). */
export function fullHexId(appId: bigint): string {
  return toHex(appId);
}

/** Truncated display: short decimals stay as-is, large IDs show `0xabcd...ef01`. */
export function formatAppId(appId: bigint): string {
  const dec = appId.toString();
  if (dec.length <= 12) return dec;
  const hex = toHex(appId);
  return `${hex.slice(0, 6)}...${hex.slice(-4)}`;
}
