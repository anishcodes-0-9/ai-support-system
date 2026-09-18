import { streamText, simulateReadableStream } from "ai";
import { openai } from "../lib/ai.js";
import { orderTools } from "../tools/order.tools.js";
import { chatService } from "../services/chat.service.js";
import { logger } from "../lib/logger.js";

export const trackingRegex = /TRK\d+/i;

const LATEST_KEYWORD = /\b(latest|most recent|recent|current)\b/i;
const SET_OF_ORDERS_SIGNAL = /\b(orders|how many|all|list|which)\b/i;

// Deterministic, keyword-based check - not an LLM call. Requires an explicit
// latest/recent/current signal AND rejects messages that read as a request
// about a set of orders (plural "orders", counts, "all", "list", "which"),
// so "how many orders did I place recently?" is correctly excluded.
export function isLatestOrderIntent(message: string): boolean {
  return LATEST_KEYWORD.test(message) && !SET_OF_ORDERS_SIGNAL.test(message);
}

export const orderAgent = {
  async handle(userId: string, conversationId: string, message: string) {
    logger.info({ userId, conversationId, message }, "OrderAgent invoked");

    const conversation = await chatService.getConversation(conversationId);
    const history = (conversation?.messages ?? []).slice(-10);
    // Drop the just-persisted current user message; it's added back explicitly below.
    const previousHistory = history.slice(0, -1);

    // Detect tracking number
    const trackingMatch = message.match(trackingRegex);

    if (trackingMatch) {
      const trackingNumber = trackingMatch[0];

      logger.info({ trackingNumber }, "Tracking number detected");

      const order = await orderTools.getOrderByTrackingNumber(trackingNumber);

      if (!order) {
        // Deterministic tool result: stream it as-is, do not let the model regenerate it.
        return {
          textStream: simulateReadableStream({
            chunks: [
              `I couldn't find an order with tracking number ${trackingNumber}. Please verify the number.`,
            ],
          }),
        };
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

      // Deterministic tool result: stream it as-is, do not let the model regenerate it.
      // orderData carries only the fields the UI needs to render a structured
      // card - never the raw DB record - so the frontend never has to parse
      // this text to recover facts it can render directly.
      return {
        textStream: simulateReadableStream({ chunks: [response] }),
        orderData: {
          productName: order.productName,
          status: order.status,
          deliveryStatus: order.deliveryStatus,
          estimatedDeliveryDate: order.estimatedDeliveryDate,
          trackingNumber: order.trackingNumber,
        },
      };
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
- Be concise and direct. Do not open with greetings or small talk, and do not
  close with filler like "let me know if you have more questions." Answer the
  question, then stop.
`,

      messages: [
        ...previousHistory.map((m: any) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        {
          role: "user",
          content: message,
        },
      ],
    });

    // Narration above uses the full order list for context. The structured
    // card is separate and only attached when the current message explicitly
    // asks about the latest/recent/current order - not on every turn this
    // branch handles, and not derived from what the LLM ends up saying.
    if (isLatestOrderIntent(message)) {
      const latestOrder = await orderTools.getLatestOrder(userId);

      if (latestOrder) {
        (result as typeof result & { orderData?: unknown }).orderData = {
          productName: latestOrder.productName,
          status: latestOrder.status,
          deliveryStatus: latestOrder.deliveryStatus,
          estimatedDeliveryDate: latestOrder.estimatedDeliveryDate,
          trackingNumber: latestOrder.trackingNumber,
        };
      }
    }

    return result;
  },
};
