import { orderService } from "../services/order.service.js";

export const orderAgent = {
  async handle(userId: string, message: string) {
    // Basic keyword routing for now
    if (message.includes("order") || message.includes("track")) {
      return orderService.getUserOrders(userId);
    }

    return { message: "I couldn't understand the order request." };
  },
};
