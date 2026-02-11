import { invoiceRepository } from "../repositories/invoice.repository.js";

export const billingTools = {
  async getInvoiceDetails(invoiceId: string) {
    const invoice = await invoiceRepository.getInvoiceById(invoiceId);

    if (!invoice) {
      return { error: "Invoice not found" };
    }

    return {
      id: invoice.id,
      amount: invoice.amount,
      status: invoice.status,
    };
  },

  async listUserInvoices(userId: string) {
    const invoices = await invoiceRepository.getInvoicesByUser(userId);

    return invoices.map((invoice) => ({
      id: invoice.id,
      amount: invoice.amount,
      status: invoice.status,
    }));
  },
};
