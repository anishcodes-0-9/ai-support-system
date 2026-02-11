import { orderRepository } from "../repositories/order.repository.js";

export const orderTools = {
  async fetchOrderDetails(orderId: string) {
    const order = await orderRepository.getOrderById(orderId);

    if (!order) {
      return { error: "Order not found" };
    }

    return {
      id: order.id,
      status: order.status,
      trackingNumber: order.trackingNumber,
      deliveryStatus: order.deliveryStatus,
    };
  },

  async listUserOrders(userId: string) {
    const orders = await orderRepository.getOrdersByUser(userId);

    return orders.map((order) => ({
      id: order.id,
      status: order.status,
      deliveryStatus: order.deliveryStatus,
    }));
  },
};
