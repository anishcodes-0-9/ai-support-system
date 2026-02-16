import type { Context } from "hono";
import { chatService } from "../services/chat.service.js";
import { routerAgent } from "../agents/router.agent.js";
import { logger } from "../lib/logger.js";
import { ValidationError, NotFoundError } from "../lib/AppError.js";
import { z } from "zod";

const sendMessageSchema = z.object({
  userId: z.string().uuid(),
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1),
});

export const chatController = {
  async sendMessage(c: Context) {
    const body = await c.req.json().catch(() => {
      throw new ValidationError("Invalid JSON body");
    });

    const parsed = sendMessageSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Invalid request payload");
    }

    const {
      userId,
      conversationId: incomingConversationId,
      message,
    } = parsed.data;

    const requestId = c.get("requestId");

    logger.info(
      { requestId, userId, incomingConversationId, message },
      "Incoming chat message",
    );

    // 🔐 Validate user exists
    const user = await chatService.getUserById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    let conversationId: string;
    let conversation;

    // If conversationId was provided, try fetching it
    if (incomingConversationId) {
      conversation = await chatService.getConversation(incomingConversationId);

      if (conversation) {
        conversationId = conversation.id;
      } else {
        logger.info(
          { requestId, userId },
          "Conversation not found, creating new conversation",
        );

        conversation = await chatService.createConversation(userId);
        conversationId = conversation.id;
      }
    } else {
      // No conversationId provided → create new one
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
