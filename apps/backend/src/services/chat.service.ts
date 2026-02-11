import { conversationRepository } from "../repositories/conversation.repository.js";

export const chatService = {
  async createConversation(userId: string) {
    return conversationRepository.createConversation(userId);
  },

  async getConversation(conversationId: string) {
    return conversationRepository.getConversationById(conversationId);
  },

  async listConversations(userId: string) {
    return conversationRepository.listUserConversations(userId);
  },

  async addMessage(conversationId: string, role: string, content: string) {
    return conversationRepository.addMessage(conversationId, role, content);
  },
};
