// src/lib/constants.test.ts
// Unit Tests — constants and display helpers
// Category: Unit Testing
// Why: prettyLabel() is used everywhere in the UI to turn enum values like
//      "WALLET" into readable labels like "Wallet". Testing it ensures the
//      display never accidentally breaks when categories or modes are added.

import { prettyLabel, CATEGORIES, TRANSPORT_MODES } from "./constants";

describe("prettyLabel", () => {
  test("capitalises first letter and lowercases rest", () => {
    expect(prettyLabel("WALLET")).toBe("Wallet");
    expect(prettyLabel("PHONE")).toBe("Phone");
    expect(prettyLabel("JEWELLERY")).toBe("Jewellery");
  });

  test("works for all defined CATEGORIES without throwing", () => {
    CATEGORIES.forEach((cat) => {
      expect(() => prettyLabel(cat)).not.toThrow();
      // result should start with an uppercase letter
      expect(prettyLabel(cat)[0]).toMatch(/[A-Z]/);
    });
  });

  test("works for all defined TRANSPORT_MODES without throwing", () => {
    TRANSPORT_MODES.forEach((mode) => {
      expect(() => prettyLabel(mode)).not.toThrow();
    });
  });

  test("handles single-character string without crashing", () => {
    expect(prettyLabel("A")).toBe("A");
  });

  test("handles already-lowercase input", () => {
    expect(prettyLabel("wallet")).toBe("wallet");
  });
});

describe("CATEGORIES constant", () => {
  test("contains expected transit-relevant categories", () => {
    expect(CATEGORIES).toContain("WALLET");
    expect(CATEGORIES).toContain("PHONE");
    expect(CATEGORIES).toContain("KEYS");
  });

  test("has at least 5 categories defined", () => {
    expect(CATEGORIES.length).toBeGreaterThanOrEqual(5);
  });
});

describe("TRANSPORT_MODES constant", () => {
  test("contains Singapore-specific transit modes", () => {
    expect(TRANSPORT_MODES).toContain("MRT");
    expect(TRANSPORT_MODES).toContain("BUS");
    expect(TRANSPORT_MODES).toContain("LRT");
    expect(TRANSPORT_MODES).toContain("INTERCHANGE");
  });
});
