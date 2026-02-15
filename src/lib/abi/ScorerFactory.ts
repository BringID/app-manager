export const scorerFactoryAbi = [
  {
    type: "function",
    name: "create",
    inputs: [],
    outputs: [{ name: "scorer", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "ScorerCreated",
    inputs: [
      { name: "scorer", type: "address", indexed: true },
      { name: "owner", type: "address", indexed: true },
    ],
  },
] as const;
