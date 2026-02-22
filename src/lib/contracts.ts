import { type Address } from "viem";

export const CREDENTIAL_REGISTRY_ADDRESS: Address =
  "0xbF9b2556e6Dd64D60E08E3669CeF2a4293e006db";

export const DEFAULT_SCORER_ADDRESS: Address =
  "0x315044578dd9480Dd25427E4a4d94b0fc2Fa4f8c";

export const SCORER_FACTORY_ADDRESS: Address =
  "0xAa03996D720C162Fdff246E1D3CEecc792986750";

export enum AppStatus {
  UNDEFINED = 0,
  ACTIVE = 1,
  SUSPENDED = 2,
}

export enum CredentialGroupStatus {
  UNDEFINED = 0,
  ACTIVE = 1,
  SUSPENDED = 2,
}
