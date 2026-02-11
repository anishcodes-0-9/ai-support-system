import { billingTools } from "../tools/billing.tools.js";

export const billingService = {
  async getInvoiceDetails(invoiceId: string) {
    return billingTools.getInvoiceDetails(invoiceId);
  },

  async getUserInvoices(userId: string) {
    return billingTools.listUserInvoices(userId);
  },
};
