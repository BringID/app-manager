import type { NextConfig } from "next";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const bringidPkg = JSON.parse(
  readFileSync(join(__dirname, "node_modules/bringid/package.json"), "utf-8"),
) as { version: string };

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BRINGID_VERSION: bringidPkg.version,
  },
};

export default nextConfig;
