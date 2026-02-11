import { prisma } from "../lib/prisma.js";

export const conversationRepository = {
  async createConversation(userId: string) {
    return prisma.conversation.create({
      data: { userId },
      include: { messages: true },
    });
  },

  async getConversationById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: { messages: true },
    });
  },

  async listUserConversations(userId: string) {
    return prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async addMessage(conversationId: string, role: string, content: string) {
    return prisma.message.create({
      data: {
        conversationId,
        role,
        content,
      },
    });
  },
};
