import { generateObject } from "ai";
import { z } from "zod";
import { openai } from "../lib/ai.js";
import { orderAgent } from "./order.agent.js";
import { billingAgent } from "./billing.agent.js";
import { supportAgent } from "./support.agent.js";

const intentSchema = z.object({
  intent: z.enum(["order", "billing", "support"]),
});

export const routerAgent = {
  async route(userId: string, conversationId: string, message: string) {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: intentSchema,
      prompt: `
Classify the user's intent into one of:
- order
- billing
- support

User message:
"${message}"

Respond only with the intent.
      `,
    });

    const intent = object.intent;

    if (intent === "order") {
      return orderAgent.handle(userId, message);
    }

    if (intent === "billing") {
      return billingAgent.handle(userId, message);
    }

    return supportAgent.handle(conversationId, message);
  },
};
