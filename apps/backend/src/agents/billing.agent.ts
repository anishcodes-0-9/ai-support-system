import { streamText } from "ai";
import { openai } from "../lib/ai.js";
import { billingTools } from "../tools/billing.tools.js";

export const billingAgent = {
  async handle(userId: string, message: string) {
    // 1️⃣ Fetch invoices manually
    const invoices = await billingTools.listUserInvoices(userId);

    // 2️⃣ Stream conversational response
    return streamText({
      model: openai("gpt-4o-mini"),

      system: `
You are a Billing Support Agent for an e-commerce platform.
Respond conversationally using the provided invoice data.
`,

      messages: [
        {
          role: "user",
          content: message,
        },
        {
          role: "system",
          content: `Invoice data: ${JSON.stringify(invoices)}`,
        },
      ],
    });
  },
};
