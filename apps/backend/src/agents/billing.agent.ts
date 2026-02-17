import { streamText } from "ai";
import { openai } from "../lib/ai.js";
import { billingTools } from "../tools/billing.tools.js";
import { chatService } from "../services/chat.service.js";

export const billingAgent = {
  async handle(userId: string, conversationId: string, message: string) {
    const conversation = await chatService.getConversation(conversationId);

    const history = conversation?.messages ?? [];

    const previousMessages = history.slice(0, history.length - 1);

    const invoices = await billingTools.listUserInvoices(userId);

    return streamText({
      model: openai(),

      system: `
You are a Billing Support Agent.
Use conversation context when relevant.
Respond conversationally using invoice data.
`,

      messages: [
        ...previousMessages.map((m: any) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
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
