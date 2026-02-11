import { prisma } from "../lib/prisma.js";

export const invoiceRepository = {
  async getInvoicesByUser(userId: string) {
    return prisma.invoice.findMany({
      where: { userId },
    });
  },

  async getInvoiceById(invoiceId: string) {
    return prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
  },
};
