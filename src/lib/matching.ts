// src/lib/matching.ts
import { LostItem, FoundItem } from "@prisma/client";

// The maximum possible score, i used to convert to a percentage.
const MAX_SCORE = 100;
const WEIGHT_CATEGORY = 40;
const WEIGHT_TRANSPORT_MODE = 20;
const WEIGHT_LOCATION = 15;
const WEIGHT_KEYWORDS = 15;
const WEIGHT_RECENCY = 10;
const RECENCY_WINDOW_DAYS = 14;

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
    score += WEIGHT_CATEGORY;
    reasons.push("Same category");
  }

  // Transport mode.
  if (lost.transportMode === found.transportMode) {
    score += WEIGHT_TRANSPORT_MODE;
    reasons.push("Same transport mode");
  }

  // Location text overlap.
  const lostLocWords = new Set(tokenize(lost.location));
  const foundLocWords = tokenize(found.location);
  const sharedLocWords = foundLocWords.filter((w) => lostLocWords.has(w));
  if (sharedLocWords.length > 0) {
    score += Math.min(sharedLocWords.length * 5, WEIGHT_LOCATION);
    reasons.push(`Shared location terms: ${Array.from(new Set(sharedLocWords)).slice(0, 2).join(", ")}`);
  }

  // Keyword overlap in title + description.
  const lostWords = new Set(tokenize(`${lost.title} ${lost.description}`));
  const foundWords = tokenize(`${found.title} ${found.description}`);
  const shared = foundWords.filter((w) => lostWords.has(w));
  const uniqueShared = Array.from(new Set(shared));
  if (uniqueShared.length > 0) {
    score += Math.min(uniqueShared.length * 5, WEIGHT_KEYWORDS);
    reasons.push(`Shared keywords: ${uniqueShared.slice(0, 3).join(", ")}`);
  }

  // Date proximity — found within 14 days of loss scores higher the closer it is.
  const gap = daysApart(lost.dateTimeOfLoss, found.dateTimeFound);
  if (gap <= RECENCY_WINDOW_DAYS) {
    const dateScore = Math.round(WEIGHT_RECENCY * (1 - gap / RECENCY_WINDOW_DAYS));
    if (dateScore > 0) {
      score += dateScore;
      reasons.push("Found around the time it was lost");
    }
  }

  const cappedScore = Math.min(score, MAX_SCORE);
  const percentage = Math.round((cappedScore / MAX_SCORE) * 100);
  return { foundItem: found, score: cappedScore, percentage, reasons };
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
    .filter((f) => f.status !== "CLOSED")
    .filter((f) => isPlausibleMatch(lost, f))
    .map((f) => scoreMatch(lost, f))
    .filter((m) => m.score >= threshold)
    .sort((a, b) => b.score - a.score);
}

export function getConfidenceLevel(percentage: number): {
  label: string;
  color: "green" | "blue" | "amber";
} {
  if (percentage >= 70) return { label: "Strong match", color: "green" };
  if (percentage >= 50) return { label: "Possible match", color: "blue" };
  return { label: "Weak match", color: "amber" };
}
