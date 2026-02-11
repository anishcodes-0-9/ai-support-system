import { orderTools } from "../tools/order.tools.js";

export const orderService = {
  async getOrderDetails(orderId: string) {
    return orderTools.fetchOrderDetails(orderId);
  },

  async getUserOrders(userId: string) {
    return orderTools.listUserOrders(userId);
  },
};
