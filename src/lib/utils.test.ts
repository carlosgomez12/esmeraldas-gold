import { describe, expect, it } from "vitest";
import { formatPrice, slugify, getInitials } from "./utils";

describe("formatPrice", () => {
  it("formats COP as integer pesos, no decimals", () => {
    expect(formatPrice(0)).toMatch(/\$\s?0/);
    expect(formatPrice(1000)).toMatch(/1\.000/);
    expect(formatPrice(1_500_000)).toMatch(/1\.500\.000/);
  });

  it("returns 'Consultar' for null/undefined", () => {
    expect(formatPrice(null)).toBe("Consultar");
    expect(formatPrice(undefined)).toBe("Consultar");
  });

  it("keeps the exact number without dividing by 100", () => {
    expect(formatPrice(5_499_900)).toMatch(/5\.499\.900/);
  });

  it("formats other currencies with decimals", () => {
    expect(formatPrice(1999, "USD")).toMatch(/\$\s?1,999\.00/);
  });
});

describe("slugify", () => {
  it("lowercases, strips accents and spaces", () => {
    expect(slugify("Anillo de Oro 18k")).toBe("anillo-de-oro-18k");
    expect(slugify("Esmeraldas Cóndor")).toBe("esmeraldas-condor");
  });

  it("collapses multiple separators and trims edges", () => {
    expect(slugify("  Collar — con  esmeralda  ")).toBe("collar-con-esmeralda");
    expect(slugify("---")).toBe("");
  });
});

describe("getInitials", () => {
  it("takes up to two initials", () => {
    expect(getInitials("María Fernanda Giraldo")).toBe("MF");
    expect(getInitials("Ana")).toBe("A");
  });

  it("handles empty input", () => {
    expect(getInitials("   ")).toBe("");
  });
});