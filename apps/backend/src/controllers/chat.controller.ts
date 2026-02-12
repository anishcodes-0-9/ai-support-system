import type { Context } from "hono";
import { chatService } from "../services/chat.service.js";
import { routerAgent } from "../agents/router.agent.js";
import { logger } from "../lib/logger.js";
import { ValidationError, NotFoundError } from "../lib/AppError.js";

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

    // 🔐 Basic validation
    if (!userId || !message) {
      throw new ValidationError("Missing required fields");
    }

    // 🔐 Validate user exists BEFORE anything else
    const user = await chatService.getUserById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    let conversationId = incomingConversationId;
    let conversation = null;

    // Fetch conversation if ID provided
    if (conversationId) {
      conversation = await chatService.getConversation(conversationId);
    }

    // Auto-create conversation if missing
    if (!conversation) {
      logger.info(
        { requestId, userId },
        "Conversation not found, creating new conversation",
      );

      conversation = await chatService.createConversation(userId);
      conversationId = conversation.id;
    }

    // 🔐 Ownership validation
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
          if ((result as any)._timeout) {
            clearTimeout((result as any)._timeout);
          }

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
