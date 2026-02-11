import { orderAgent } from "./order.agent.js";
import { billingAgent } from "./billing.agent.js";
import { supportAgent } from "./support.agent.js";

export const routerAgent = {
  async route(userId: string, conversationId: string, message: string) {
    const lower = message.toLowerCase();

    if (
      lower.includes("order") ||
      lower.includes("track") ||
      lower.includes("delivery")
    ) {
      return orderAgent.handle(userId, message);
    }

    if (
      lower.includes("invoice") ||
      lower.includes("refund") ||
      lower.includes("payment")
    ) {
      return billingAgent.handle(userId, message);
    }

    return supportAgent.handle(conversationId);
  },
};
