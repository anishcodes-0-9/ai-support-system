import { describe, it, expect } from "vitest";
import { sendMessageSchema } from "./chat.controller.js";

const validUserId = "4b200b02-1798-4d8a-9619-fb08176e4962";
const validConversationId = "91d189ff-1f01-41a3-a9a0-bd5d1da45580";

describe("sendMessageSchema", () => {
  it("accepts a valid payload without conversationId", () => {
    const result = sendMessageSchema.safeParse({
      userId: validUserId,
      message: "hello",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid payload with conversationId", () => {
    const result = sendMessageSchema.safeParse({
      userId: validUserId,
      conversationId: validConversationId,
      message: "hello",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-uuid userId", () => {
    const result = sendMessageSchema.safeParse({
      userId: "not-a-uuid",
      message: "hello",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-uuid conversationId", () => {
    const result = sendMessageSchema.safeParse({
      userId: validUserId,
      conversationId: "not-a-uuid",
      message: "hello",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty message", () => {
    const result = sendMessageSchema.safeParse({
      userId: validUserId,
      message: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing message", () => {
    const result = sendMessageSchema.safeParse({
      userId: validUserId,
    });
    expect(result.success).toBe(false);
  });
});
