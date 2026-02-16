import { type Address } from "viem";

export const CREDENTIAL_REGISTRY_ADDRESS: Address =
  "0xfd600B14Dc5A145ec9293Fd5768ae10Ccc1E91Fe";

export const DEFAULT_SCORER_ADDRESS: Address =
  "0x6a0b5ba649C7667A0C4Cd7FE8a83484AEE6C5345";

export const SCORER_FACTORY_ADDRESS: Address =
  "0x05321FAAD6315a04d5024Ee5b175AB1C62a3fd44";

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
