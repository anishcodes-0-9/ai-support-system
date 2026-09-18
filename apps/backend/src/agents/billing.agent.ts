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
Respond using the invoice data provided.
Be concise and direct. Do not open with greetings or small talk, and do not
close with filler like "let me know if you have more questions." Answer the
question, then stop.
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
