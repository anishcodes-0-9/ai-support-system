import { prisma } from "../lib/prisma.js";

export const orderRepository = {
  async getOrdersByUser(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async getOrderById(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
    });
  },

  async getLatestOrder(userId: string) {
    return prisma.order.findFirst({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async getOrderByTrackingNumber(trackingNumber: string) {
    return prisma.order.findFirst({
      where: {
        trackingNumber,
      },
    });
  },
};
