import { streamText, tool } from "ai";
import { z } from "zod";
import { openai } from "../lib/ai.js";
import { billingTools } from "../tools/billing.tools.js";

type BillingToolInput = {
  userId: string;
};

type BillingToolOutput = {
  id: string;
  amount: number;
  status: string;
}[];

export const billingAgent = {
  async handle(userId: string, message: string) {
    return streamText({
      model: openai("gpt-4o-mini"),

      system: `
You are a Billing Support Agent.
Help users with invoices, payments, and refunds.
Respond conversationally.
Use tools when needed.
`,

      messages: [
        {
          role: "user",
          content: message,
        },
      ],

      tools: {
        getUserInvoices: tool<BillingToolInput, BillingToolOutput>({
          description: "Fetch all invoices for a user",
          inputSchema: z.object({
            userId: z.string(),
          }),
          execute: async ({ userId }) => {
            return billingTools.listUserInvoices(userId);
          },
        }),
      },
    });
  },
};
