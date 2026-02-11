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
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      createdAt: order.createdAt,
    };
  },

  async listUserOrders(userId: string) {
    // 🔥 Return FULL order objects
    return orderRepository.getOrdersByUser(userId);
  },
};
