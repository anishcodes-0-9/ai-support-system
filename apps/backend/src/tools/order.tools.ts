import { orderRepository } from "../repositories/order.repository.js";
import { logger } from "../lib/logger.js";

export const orderTools = {
  async getLatestOrder(userId: string) {
    logger.debug({ userId }, "Fetching latest order");

    const order = await orderRepository.getLatestOrder(userId);

    if (!order) {
      return null;
    }

    return order;
  },

  async getOrderByTrackingNumber(trackingNumber: string) {
    logger.debug({ trackingNumber }, "Fetching order by tracking number");

    const order =
      await orderRepository.getOrderByTrackingNumber(trackingNumber);

    if (!order) {
      return null;
    }

    return order;
  },

  async fetchOrderDetails(orderId: string) {
    logger.debug({ orderId }, "Fetching order details");

    const order = await orderRepository.getOrderById(orderId);

    if (!order) {
      return { error: "Order not found" };
    }

    return {
      id: order.id,
      productName: order.productName,
      status: order.status,
      trackingNumber: order.trackingNumber,
      deliveryStatus: order.deliveryStatus,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      createdAt: order.createdAt,
    };
  },

  async listUserOrders(userId: string) {
    logger.debug({ userId }, "Listing user orders");

    return orderRepository.getOrdersByUser(userId);
  },
};
