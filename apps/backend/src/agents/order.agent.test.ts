import { describe, it, expect } from "vitest";
import { trackingRegex } from "./order.agent.js";

describe("trackingRegex", () => {
  it("matches a standard tracking number", () => {
    expect("TRK123456".match(trackingRegex)?.[0]).toBe("TRK123456");
  });

  it("matches case-insensitively", () => {
    expect("trk123456".match(trackingRegex)?.[0]).toBe("trk123456");
  });

  it("matches a tracking number embedded in a sentence", () => {
    const match = "Where is TRK999111, has it shipped?".match(trackingRegex);
    expect(match?.[0]).toBe("TRK999111");
  });

  it("does not match a message with no tracking number", () => {
    expect("Where is my latest order?".match(trackingRegex)).toBeNull();
  });

  it("does not match the bare prefix with no digits", () => {
    expect("TRK".match(trackingRegex)).toBeNull();
  });
});
