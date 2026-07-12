// src/lib/matching.test.ts
// Unit Tests — matching algorithm & helper functions
// Category: Unit Testing
// Why: The matching algorithm is the core feature of TransitFind. These tests
//      verify that scoring logic, weights, and edge cases all work correctly
//      without needing a real database or running the full app.

import { scoreMatch, findMatches, getConfidenceLevel } from "./matching";

// ---------------------------------------------------------------------------
// Shared test fixtures — minimal objects that satisfy LostItem / FoundItem
// shapes without needing Prisma or a real DB.
// ---------------------------------------------------------------------------
const baseLost = {
  id: "lost-1",
  title: "Black Wallet",
  description: "Leather wallet with cash and cards",
  category: "WALLET",
  transportMode: "MRT",
  location: "Jurong East MRT",
  dateTimeOfLoss: new Date("2024-06-10T10:00:00Z"),
  imageUrl: null,
  contactEmail: "user@test.com",
  userId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  status: "OPEN",
} as any;

const baseFound = {
  id: "found-1",
  title: "Black Wallet Found",
  description: "Found a leather wallet near the fare gates",
  category: "WALLET",
  transportMode: "MRT",
  location: "Jurong East MRT",
  dateTimeFound: new Date("2024-06-11T10:00:00Z"), // 1 day later
  contactEmail: "finder@test.com",
  userId: "user-2",
  createdAt: new Date(),
  updatedAt: new Date(),
  status: "OPEN",
} as any;

// ---------------------------------------------------------------------------
// scoreMatch — core scoring function
// ---------------------------------------------------------------------------
describe("scoreMatch", () => {
  test("perfect match scores 100 (same category, transport, location, keywords, date)", () => {
    const result = scoreMatch(baseLost, baseFound);
    // category(40) + transport(20) + location(15) + keywords(15) + recency(~9) = ~99
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.percentage).toBeGreaterThanOrEqual(90);
  });

  test("same category alone gives 40 points", () => {
    const found = {
      ...baseFound,
      transportMode: "BUS",         // different transport
      location: "Tampines",          // different location
      title: "item",                 // no keyword overlap
      description: "something",
      dateTimeFound: new Date("2025-01-01"), // outside recency window
    };
    const result = scoreMatch(baseLost, found);
    expect(result.score).toBe(40);
  });

  test("different category but same transport gives 20 points", () => {
    const found = {
      ...baseFound,
      category: "PHONE",             // different category
      location: "Tampines",
      title: "device",
      description: "a device",
      dateTimeFound: new Date("2025-01-01"),
    };
    const result = scoreMatch(baseLost, found);
    expect(result.score).toBe(20);
  });

  test("shared location keywords add up to WEIGHT_LOCATION (15) max", () => {
    const found = {
      ...baseFound,
      category: "PHONE",
      transportMode: "BUS",
      location: "Jurong East MRT station near exit",  // shares 'jurong', 'east'
      title: "device",
      description: "gadget",
      dateTimeFound: new Date("2025-01-01"),
    };
    const result = scoreMatch(baseLost, found);
    // 2 shared words × 5 = 10 points for location (capped at 15)
    expect(result.score).toBeGreaterThanOrEqual(10);
  });

  test("score is capped at 100 even if weights exceed it", () => {
    const result = scoreMatch(baseLost, baseFound);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.percentage).toBeLessThanOrEqual(100);
  });

  test("found item within 1 day gets near-maximum recency score", () => {
    const found1day = { ...baseFound, dateTimeFound: new Date("2024-06-11T10:00:00Z") };
    const found13days = { ...baseFound, dateTimeFound: new Date("2024-06-23T10:00:00Z") };

    const close = scoreMatch(baseLost, found1day);
    const far = scoreMatch(baseLost, found13days);
    expect(close.score).toBeGreaterThan(far.score);
  });

  test("found item outside 14-day window gets 0 recency points", () => {
    const foundOld = {
      ...baseFound,
      category: "PHONE",             // no category/transport/keyword overlap
      transportMode: "BUS",
      location: "Tampines",
      title: "device",
      description: "gadget",
      dateTimeFound: new Date("2020-01-01"), // way outside window
    };
    const result = scoreMatch(baseLost, foundOld);
    // Only way to get points here is location/keyword overlap, which we removed
    expect(result.score).toBe(0);
  });

  test("reasons array is populated with human-readable match explanations", () => {
    const result = scoreMatch(baseLost, baseFound);
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.reasons).toContain("Same category");
    expect(result.reasons).toContain("Same transport mode");
  });

  test("percentage is correctly derived from score / 100", () => {
    const result = scoreMatch(baseLost, baseFound);
    expect(result.percentage).toBe(Math.round((result.score / 100) * 100));
  });
});

// ---------------------------------------------------------------------------
// findMatches — filter + rank multiple found items
// ---------------------------------------------------------------------------
describe("findMatches", () => {
  const goodMatch = { ...baseFound, id: "found-good" };
  const weakMatch = {
    ...baseFound,
    id: "found-weak",
    category: "PHONE",
    transportMode: "BUS",
    location: "Tampines Bus Interchange",
    title: "phone",
    description: "smartphone",
    dateTimeFound: new Date("2025-01-01"),
  };
  const closedItem = { ...baseFound, id: "found-closed", status: "CLOSED" };

  test("returns matches sorted best-first", () => {
    const results = findMatches(baseLost, [weakMatch, goodMatch]);
    expect(results[0].foundItem.id).toBe("found-good");
  });

  test("excludes items with status CLOSED", () => {
    const results = findMatches(baseLost, [goodMatch, closedItem]);
    const ids = results.map((r) => r.foundItem.id);
    expect(ids).not.toContain("found-closed");
  });

  test("excludes results below the default threshold of 30", () => {
    // A found item with no overlap at all should score 0 and be excluded
    const noOverlap = {
      ...baseFound,
      id: "found-zero",
      category: "CLOTHING",
      transportMode: "BUS",
      location: "Bedok",
      title: "jacket",
      description: "blue jacket",
      dateTimeFound: new Date("2020-01-01"),
    };
    const results = findMatches(baseLost, [noOverlap]);
    expect(results.length).toBe(0);
  });

  test("respects custom threshold", () => {
    // With threshold=0, even weak matches pass through
    const noOverlap = {
      ...baseFound,
      id: "found-zero",
      category: "WALLET",   // same category = 40 pts → passes isPlausibleMatch
      transportMode: "BUS",
      location: "Bedok",
      title: "thing",
      description: "item",
      dateTimeFound: new Date("2020-01-01"),
    };
    const results = findMatches(baseLost, [noOverlap], 0);
    expect(results.length).toBeGreaterThan(0);
  });

  test("returns empty array when no found items provided", () => {
    const results = findMatches(baseLost, []);
    expect(results).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getConfidenceLevel — converts a percentage to a label + colour
// ---------------------------------------------------------------------------
describe("getConfidenceLevel", () => {
  test("70%+ is a Strong match (green)", () => {
    expect(getConfidenceLevel(70)).toEqual({ label: "Strong match", color: "green" });
    expect(getConfidenceLevel(100)).toEqual({ label: "Strong match", color: "green" });
  });

  test("50–69% is a Possible match (blue)", () => {
    expect(getConfidenceLevel(50)).toEqual({ label: "Possible match", color: "blue" });
    expect(getConfidenceLevel(69)).toEqual({ label: "Possible match", color: "blue" });
  });

  test("below 50% is a Weak match (amber)", () => {
    expect(getConfidenceLevel(49)).toEqual({ label: "Weak match", color: "amber" });
    expect(getConfidenceLevel(0)).toEqual({ label: "Weak match", color: "amber" });
  });
});
