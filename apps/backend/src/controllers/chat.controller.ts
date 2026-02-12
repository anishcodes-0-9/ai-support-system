import type { Context } from "hono";
import { chatService } from "../services/chat.service.js";
import { routerAgent } from "../agents/router.agent.js";
import { ValidationError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export const chatController = {
  async sendMessage(c: Context) {
    const {
      userId,
      conversationId: incomingConversationId,
      message,
    } = await c.req.json();

    const requestId = c.get("requestId");

    logger.info(
      { requestId, userId, incomingConversationId, message },
      "Incoming chat message",
    );

    if (!userId || !message) {
      throw new ValidationError("Missing required fields");
    }

    let conversationId = incomingConversationId;

    // Fetch conversation
    let conversation = await chatService.getConversation(conversationId);

    // Auto-create if missing
    if (!conversation) {
      logger.info(
        { requestId, userId },
        "Conversation not found, creating new conversation",
      );

      conversation = await chatService.createConversation(userId);
      conversationId = conversation.id;
    }

    // Ownership validation
    if (conversation.userId !== userId) {
      throw new ValidationError("Unauthorized conversation access");
    }

    logger.debug({ requestId, conversationId }, "Conversation validated");

    // Persist user message
    await chatService.addMessage(conversationId, "user", message);

    logger.debug({ requestId }, "User message persisted");

    // Route to agent
    const result = await routerAgent.route(userId, conversationId, message);

    logger.info({ requestId }, "Agent routing complete, streaming response");

    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = result.textStream.getReader();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            fullResponse += value;
            controller.enqueue(value);
          }

          controller.close();

          await chatService.addMessage(
            conversationId,
            "assistant",
            fullResponse,
          );

          logger.info({ requestId }, "Assistant response persisted");
        } catch (err) {
          logger.error({ requestId, err }, "Streaming failed");
          controller.error(err);
        }
      },
    });

    return c.body(stream, 200, {
      "Content-Type": "text/plain; charset=utf-8",
    });
  },
};
