import { streamText } from "ai";
import { openai } from "../lib/ai.js";
import { orderTools } from "../tools/order.tools.js";
import { chatService } from "../services/chat.service.js";
import { logger } from "../lib/logger.js";

const trackingRegex = /TRK\d+/i;

export const orderAgent = {
  async handle(userId: string, conversationId: string, message: string) {
    logger.info({ userId, conversationId, message }, "OrderAgent invoked");

    const conversation = await chatService.getConversation(conversationId);
    const history = (conversation?.messages ?? []).slice(-10);

    // Detect tracking number
    const trackingMatch = message.match(trackingRegex);

    if (trackingMatch) {
      const trackingNumber = trackingMatch[0];

      logger.info({ trackingNumber }, "Tracking number detected");

      const order = await orderTools.getOrderByTrackingNumber(trackingNumber);

      if (!order) {
        return streamText({
          model: openai(),
          messages: [
            {
              role: "assistant",
              content: `I couldn't find an order with tracking number ${trackingNumber}. Please verify the number.`,
            },
          ],
        });
      }

      const response = `
The tracking number ${trackingNumber} is for your ${order.productName}.

Status: ${order.status}
Delivery Status: ${order.deliveryStatus ?? "Not available"}
Estimated Delivery: ${
        order.estimatedDeliveryDate
          ? new Date(order.estimatedDeliveryDate).toDateString()
          : "Not available"
      }
`;

      return streamText({
        model: openai(),
        messages: [{ role: "assistant", content: response }],
      });
    }

    // Otherwise show normal orders
    const orders = await orderTools.listUserOrders(userId);

    const formattedOrders =
      orders.length === 0
        ? "User has no orders."
        : orders
            .map(
              (o, index) => `
Order ${index + 1}
Product: ${o.productName}
Status: ${o.status}
Tracking Number: ${o.trackingNumber ?? "Not available"}
Delivery Status: ${o.deliveryStatus ?? "Not available"}
Estimated Delivery: ${
                o.estimatedDeliveryDate
                  ? new Date(o.estimatedDeliveryDate).toDateString()
                  : "Not available"
              }
`,
            )
            .join("\n");

    const result = streamText({
      model: openai(),

      system: `
You are an AI Order Support Agent.

Here are the user's orders:

${formattedOrders}

Rules:
- If the user asks about delivery, reference the deliveryStatus.
- If the user asks about their latest order, use the most recent order.
- Always mention the product name.
- Always include delivery date if available.
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

    return result;
  },
};
