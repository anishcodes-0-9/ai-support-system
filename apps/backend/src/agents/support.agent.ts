import { supportService } from "../services/support.service.js";

export const supportAgent = {
  async handle(conversationId: string) {
    return supportService.getConversationHistory(conversationId);
  },
};
