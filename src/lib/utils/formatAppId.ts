export function formatAppId(appId: bigint): string {
  const str = appId.toString();
  if (str.length <= 12) return str;
  return `${str.slice(0, 5)}...${str.slice(-4)}`;
}
