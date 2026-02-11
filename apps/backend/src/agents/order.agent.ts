import { streamText } from "ai";
import { openai } from "../lib/ai.js";
import { orderTools } from "../tools/order.tools.js";

export const orderAgent = {
  async handle(userId: string, message: string) {
    // 1️⃣ Fetch orders manually
    const orders = await orderTools.listUserOrders(userId);

    // 2️⃣ Stream conversational response
    return streamText({
      model: openai("gpt-4o-mini"),

      system: `
You are an Order Support Agent for an e-commerce platform.
Respond conversationally based on the provided order data.
`,

      messages: [
        {
          role: "user",
          content: message,
        },
        {
          role: "system",
          content: `Order data: ${JSON.stringify(orders)}`,
        },
      ],
    });
  },
};
