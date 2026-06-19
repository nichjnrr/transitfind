// src/lib/matching.ts
import { LostItem, FoundItem } from "@prisma/client";

// The maximum possible score, i used to convert to a percentage.
const MAX_SCORE = 100;

// score match system along with the found item plus why it matched.
export interface ScoredMatch {
  foundItem: FoundItem;
  score: number;       // raw points
  percentage: number;  // 0–100, for display
  reasons: string[];   // human-readable explanation
}

// Pull lowercase word tokens (length > 2) from a string.
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

// How many days apart two dates are.
function daysApart(a: Date, b: Date): number {
  const ms = Math.abs(a.getTime() - b.getTime());
  return ms / (1000 * 60 * 60 * 24);
}

// Score a single found item against a lost item.
export function scoreMatch(lost: LostItem, found: FoundItem): ScoredMatch {
  let score = 0;
  const reasons: string[] = [];

  // Category — strongest signal.
  if (lost.category === found.category) {
    score += 40;
    reasons.push("Same category");
  }

  // Transport mode.
  if (lost.transportMode === found.transportMode) {
    score += 20;
    reasons.push("Same transport mode");
  }

  // Location text overlap.
  const lostLoc = lost.location.toLowerCase();
  const foundLoc = found.location.toLowerCase();
  if (
    lostLoc === foundLoc ||
    lostLoc.includes(foundLoc) ||
    foundLoc.includes(lostLoc)
  ) {
    score += 15;
    reasons.push("Matching location");
  }

  // Keyword overlap in title + description.
  const lostWords = new Set(tokenize(`${lost.title} ${lost.description}`));
  const foundWords = tokenize(`${found.title} ${found.description}`);
  const shared = foundWords.filter((w) => lostWords.has(w));
  const uniqueShared = Array.from(new Set(shared));
  if (uniqueShared.length > 0) {
    score += Math.min(uniqueShared.length * 5, 15);
    reasons.push(`Shared keywords: ${uniqueShared.slice(0, 3).join(", ")}`);
  }

  // Date proximity — found within 14 days of loss scores higher the closer it is.
  const gap = daysApart(lost.dateTimeOfLoss, found.dateTimeFound);
  if (gap <= 14) {
    const dateScore = Math.round(10 * (1 - gap / 14));
    if (dateScore > 0) {
      score += dateScore;
      reasons.push("Found around the time it was lost");
    }
  }

  const percentage = Math.min(Math.round((score / MAX_SCORE) * 100), 100);
  return { foundItem: found, score, percentage, reasons };
}

function isPlausibleMatch(lost: LostItem, found: FoundItem): boolean {
  if (lost.category === found.category) return true;

  const lostWords = new Set(tokenize(`${lost.title} ${lost.description}`));
  const foundWords = tokenize(`${found.title} ${found.description}`);
  return foundWords.some((w) => lostWords.has(w));
}

// Rank all found items against a lost item, best first.
// Only returns matches scoring above `threshold` (default 30).
export function findMatches(
  lost: LostItem,
  foundItems: FoundItem[],
  threshold = 30
): ScoredMatch[] {
  return foundItems
    .map((f) => scoreMatch(lost, f))
    .filter((m) => m.score >= threshold)
    .sort((a, b) => b.score - a.score);
}
