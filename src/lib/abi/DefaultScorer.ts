export const defaultScorerAbi = [
  {
    type: "function",
    name: "getAllScores",
    inputs: [],
    outputs: [
      { name: "credentialGroupIds_", type: "uint256[]" },
      { name: "scores_", type: "uint256[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getScore",
    inputs: [{ name: "credentialGroupId_", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getScores",
    inputs: [{ name: "credentialGroupIds_", type: "uint256[]" }],
    outputs: [{ name: "scores_", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setScore",
    inputs: [
      { name: "credentialGroupId_", type: "uint256" },
      { name: "score_", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setScores",
    inputs: [
      { name: "credentialGroupIds_", type: "uint256[]" },
      { name: "scores_", type: "uint256[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
