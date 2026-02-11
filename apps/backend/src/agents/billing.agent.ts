import { billingService } from "../services/billing.service.js";

export const billingAgent = {
  async handle(userId: string, message: string) {
    if (
      message.includes("invoice") ||
      message.includes("refund") ||
      message.includes("payment")
    ) {
      return billingService.getUserInvoices(userId);
    }

    return { message: "I couldn't understand the billing request." };
  },
};
