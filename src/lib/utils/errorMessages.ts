const CUSTOM_ERROR_MESSAGES: Record<string, string> = {
  NotAppAdmin: "You are not the admin of this app.",
  AppNotActive: "This app is currently suspended.",
  AppNotSuspended: "This app is already active.",
  InvalidAdminAddress: "Invalid admin address (cannot be zero).",
  NotPendingAdmin: "You are not the pending admin for this app.",
  InvalidScorerContract:
    "This address does not implement the IScorer interface.",
  InvalidScorerAddress: "Invalid scorer address.",
};

export function getUserFriendlyError(error: unknown): string {
  const message =
    error instanceof Error ? error.message : String(error);

  for (const [errorName, friendly] of Object.entries(CUSTOM_ERROR_MESSAGES)) {
    if (message.includes(errorName)) {
      return friendly;
    }
  }

  if (message.includes("User rejected")) {
    return "Transaction was rejected.";
  }

  if (message.includes("insufficient funds")) {
    return "Insufficient funds for transaction.";
  }

  return "Transaction failed. Please try again.";
}
