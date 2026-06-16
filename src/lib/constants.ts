// src/lib/constants.ts
export const CATEGORIES = [
  "WALLET", "PHONE", "KEYS", "BAG", "CLOTHING",
  "ELECTRONICS", "DOCUMENTS", "JEWELLERY", "UMBRELLA", "OTHER",
] as const;

export const TRANSPORT_MODES = ["MRT", "BUS", "LRT", "INTERCHANGE"] as const;

// nic's note, the whole pt of this is: Turns "WALLET" into "Wallet" for display
export function prettyLabel(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
