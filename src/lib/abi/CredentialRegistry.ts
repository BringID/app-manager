export const credentialRegistryAbi = [
  {
    type: "function",
    name: "registerApp",
    inputs: [{ name: "recoveryTimelock_", type: "uint256" }],
    outputs: [{ name: "appId_", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "suspendApp",
    inputs: [{ name: "appId_", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "activateApp",
    inputs: [{ name: "appId_", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setAppRecoveryTimelock",
    inputs: [
      { name: "appId_", type: "uint256" },
      { name: "recoveryTimelock_", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setAppAdmin",
    inputs: [
      { name: "appId_", type: "uint256" },
      { name: "newAdmin_", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setAppScorer",
    inputs: [
      { name: "appId_", type: "uint256" },
      { name: "scorer_", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "apps",
    inputs: [{ name: "appId", type: "uint256" }],
    outputs: [
      { name: "status", type: "uint8" },
      { name: "recoveryTimelock", type: "uint256" },
      { name: "admin", type: "address" },
      { name: "scorer", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "appIsActive",
    inputs: [{ name: "appId_", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "defaultScorer",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "nextAppId",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "credentialGroups",
    inputs: [{ name: "credentialGroupId", type: "uint256" }],
    outputs: [
      { name: "semaphoreGroupId", type: "uint256" },
      { name: "status", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCredentialGroupIds",
    inputs: [],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "AppRegistered",
    inputs: [
      { name: "appId", type: "uint256", indexed: true },
      { name: "admin", type: "address", indexed: true },
      { name: "recoveryTimelock", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AppAdminTransferred",
    inputs: [
      { name: "appId", type: "uint256", indexed: true },
      { name: "oldAdmin", type: "address", indexed: true },
      { name: "newAdmin", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "AppSuspended",
    inputs: [{ name: "appId", type: "uint256", indexed: true }],
  },
  {
    type: "event",
    name: "AppActivated",
    inputs: [{ name: "appId", type: "uint256", indexed: true }],
  },
  {
    type: "event",
    name: "AppScorerSet",
    inputs: [
      { name: "appId", type: "uint256", indexed: true },
      { name: "scorer", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "AppRecoveryTimelockSet",
    inputs: [
      { name: "appId", type: "uint256", indexed: true },
      { name: "timelock", type: "uint256", indexed: false },
    ],
  },
] as const;
