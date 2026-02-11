import type { Context } from "hono";
import { chatService } from "../services/chat.service.js";
import { routerAgent } from "../agents/router.agent.js";

export const chatController = {
  async sendMessage(c: Context) {
    const { userId, conversationId, message } = await c.req.json();

    if (!userId || !conversationId || !message) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    await chatService.addMessage(conversationId, "user", message);

    const result = await routerAgent.route(userId, conversationId, message);

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
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return c.body(stream, 200, {
      "Content-Type": "text/plain; charset=utf-8",
    });
  },

  async getConversation(c: Context) {
    const id = c.req.param("id");
    const conversation = await chatService.getConversation(id);
    return c.json(conversation);
  },

  async listConversations(c: Context) {
    const userId = c.req.query("userId");

    if (!userId) {
      return c.json({ error: "Missing userId" }, 400);
    }

    const conversations = await chatService.listConversations(userId);

    return c.json(conversations);
  },

  async deleteConversation(c: Context) {
    return c.json({
      message: "Delete not implemented yet",
    });
  },
};
