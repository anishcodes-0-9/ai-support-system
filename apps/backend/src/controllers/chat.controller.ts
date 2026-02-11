import type { Context } from "hono";
import { chatService } from "../services/chat.service.js";
import { routerAgent } from "../agents/router.agent.js";

export const chatController = {
  async sendMessage(c: Context) {
    const { userId, conversationId, message } = await c.req.json();

    if (!userId || !conversationId || !message) {
      return c.json({ error: "Missing fields" }, 400);
    }

    // Save user message
    await chatService.addMessage(conversationId, "user", message);

    // Route message
    const agentResponse = await routerAgent.route(
      userId,
      conversationId,
      message,
    );

    // Save agent response
    await chatService.addMessage(
      conversationId,
      "assistant",
      JSON.stringify(agentResponse),
    );

    return c.json(agentResponse);
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
    const id = c.req.param("id");
    // Optional: implement delete in repository later
    return c.json({ message: "Delete not implemented yet" });
  },
};
