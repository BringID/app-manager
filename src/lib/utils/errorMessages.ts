const REVERT_MESSAGES: Record<string, string> = {
  "BID::not app admin": "You are not the admin of this app.",
  "BID::app not active": "This app is currently suspended.",
  "BID::app not suspended": "This app is already active.",
  "BID::invalid scorer address": "Invalid scorer address.",
  "BID::invalid admin address": "Invalid admin address.",
};

export function getUserFriendlyError(error: unknown): string {
  const message =
    error instanceof Error ? error.message : String(error);

  for (const [revert, friendly] of Object.entries(REVERT_MESSAGES)) {
    if (message.includes(revert)) {
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
