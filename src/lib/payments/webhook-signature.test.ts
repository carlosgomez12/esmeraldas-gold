import { describe, expect, it } from "vitest";
import {
  verifyWompiSignature,
  parseWompiEvent,
  buildWompiSignature,
} from "./webhook-signature";

const SECRET = "whsec_test_123abc";
const TIMESTAMP = "1700000000";
const BODY = JSON.stringify({
  event: "transaction.updated",
  data: {
    transaction: { id: "txn_001", status: "APPROVED" },
  },
});

describe("verifyWompiSignature", () => {
  it("accepts a valid signature", () => {
    const sig = buildWompiSignature(BODY, TIMESTAMP, SECRET);
    expect(
      verifyWompiSignature(BODY, { "x-signature": sig, "x-timestamp": TIMESTAMP }, SECRET)
    ).toBe(true);
  });

  it("rejects a tampered body", () => {
    const sig = buildWompiSignature(BODY, TIMESTAMP, SECRET);
    expect(
      verifyWompiSignature(
        BODY.replace("APPROVED", "DECLINED"),
        { "x-signature": sig, "x-timestamp": TIMESTAMP },
        SECRET
      )
    ).toBe(false);
  });

  it("rejects a wrong secret", () => {
    const sig = buildWompiSignature(BODY, TIMESTAMP, "other-secret");
    expect(
      verifyWompiSignature(BODY, { "x-signature": sig, "x-timestamp": TIMESTAMP }, SECRET)
    ).toBe(false);
  });

  it("rejects missing signature or secret", () => {
    expect(verifyWompiSignature(BODY, { "x-timestamp": TIMESTAMP }, SECRET)).toBe(false);
    expect(verifyWompiSignature(BODY, { "x-signature": "abc", "x-timestamp": TIMESTAMP }, null)).toBe(false);
    expect(verifyWompiSignature(BODY, { "x-signature": "abc", "x-timestamp": TIMESTAMP }, "")).toBe(false);
  });

  it("accepts the sha256= prefix", () => {
    const sig = `sha256=${buildWompiSignature(BODY, TIMESTAMP, SECRET)}`;
    expect(
      verifyWompiSignature(BODY, { "x-signature": sig, "x-timestamp": TIMESTAMP }, SECRET)
    ).toBe(true);
  });

  it("is timestamp-sensitive", () => {
    const sig = buildWompiSignature(BODY, TIMESTAMP, SECRET);
    expect(
      verifyWompiSignature(BODY, { "x-signature": sig, "x-timestamp": "9999999999" }, SECRET)
    ).toBe(false);
  });
});

describe("parseWompiEvent", () => {
  it("parses a valid transaction event", () => {
    const event = parseWompiEvent(BODY);
    expect(event).not.toBeNull();
    expect(event?.transactionId).toBe("txn_001");
    expect(event?.status).toBe("APPROVED");
  });

  it("returns null when required fields are missing", () => {
    const noTransaction = parseWompiEvent(JSON.stringify({ event: "x" }));
    const empty = parseWompiEvent(JSON.stringify({}));
    expect(noTransaction).toBeNull();
    expect(empty).toBeNull();
  });

  it("returns null on invalid JSON", () => {
    expect(parseWompiEvent("{not json")).toBeNull();
  });
});