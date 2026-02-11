import { supportTools } from "../tools/support.tools.js";

export const supportService = {
  async getConversationHistory(conversationId: string) {
    return supportTools.getConversationHistory(conversationId);
  },
};
