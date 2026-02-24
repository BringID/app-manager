import { type Address } from "viem";

export const CREDENTIAL_REGISTRY_ADDRESS: Address =
  "0x17a22f130d4e1c4ba5C20a679a5a29F227083A62";

export const DEFAULT_SCORER_ADDRESS: Address =
  "0x6791B588dAdeb4323bc1C3d987130bC13cBe3625";

export const SCORER_FACTORY_ADDRESS: Address =
  "0x016bC46169533a8d3284c5D8DD590C91783C8C06";

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
