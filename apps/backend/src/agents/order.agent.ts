import { streamText } from "ai";
import { openai } from "../lib/ai.js";
import { orderTools } from "../tools/order.tools.js";
import { chatService } from "../services/chat.service.js";

export const orderAgent = {
  async handle(userId: string, conversationId: string, message: string) {
    const conversation = await chatService.getConversation(conversationId);

    const history = conversation?.messages ?? [];

    // Fetch all orders sorted by createdAt DESC (repository should already sort)
    const orders = await orderTools.listUserOrders(userId);

    // Format all orders clearly for the model
    const formattedOrders =
      orders.length === 0
        ? "No orders found."
        : orders
            .map(
              (o, index) => `
Order ${index + 1}:
Status: ${o.status}
Delivery Status: ${o.deliveryStatus ?? "Not available"}
Estimated Delivery Date: ${
                o.estimatedDeliveryDate
                  ? new Date(o.estimatedDeliveryDate).toDateString()
                  : "Not available"
              }
Created At: ${new Date(o.createdAt).toDateString()}
`,
            )
            .join("\n");

    return streamText({
      model: openai("gpt-4o-mini"),

      system: `
You are an Order Support Agent.

User Orders:
${formattedOrders}

Rules:
- If the user asks about their delivered order, respond using the order with status "DELIVERED".
- If the user asks about their latest order, use the most recently created order.
- If the user asks about an in-transit order, use the order with deliveryStatus "In Transit".
- Always mention the estimated delivery date if available.
- Never use vague phrases like "soon" if a date exists.
- Do not guess.
Respond clearly and conversationally.
`,

      messages: [
        ...history.map((m: any) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        {
          role: "user",
          content: message,
        },
      ],
    });
  },
};
