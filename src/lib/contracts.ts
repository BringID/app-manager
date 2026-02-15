import { type Address } from "viem";

export const CREDENTIAL_REGISTRY_ADDRESS: Address =
  "0x4CeA320D9b08A3a32cfD55360E0fc2137542478d";

export const DEFAULT_SCORER_ADDRESS: Address =
  "0xcE4A14a929FfF47df30216f4C8fa8907825F494F";

export const SCORER_FACTORY_ADDRESS: Address =
  "0x7cE2d6AdA1a9ba7B03b1F6d0C84EC01c3005cCa9";

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
