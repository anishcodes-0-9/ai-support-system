import { conversationRepository } from "../repositories/conversation.repository.js";

export const supportTools = {
  async getConversationHistory(conversationId: string) {
    const conversation =
      await conversationRepository.getConversationById(conversationId);

    if (!conversation) {
      return { error: "Conversation not found" };
    }

    return conversation.messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));
  },
};
