import { generateObject } from "ai";
import { z } from "zod";
import { openai } from "../lib/ai.js";
import { orderAgent } from "./order.agent.js";
import { billingAgent } from "./billing.agent.js";
import { supportAgent } from "./support.agent.js";
import { logger } from "../lib/logger.js";

const intentSchema = z.object({
  intent: z.enum(["order", "billing", "support"]),
});

export const routerAgent = {
  async route(userId: string, conversationId: string, message: string) {
    try {
      logger.info(
        { userId, conversationId, message },
        "Router received message",
      );

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

      logger.info({ intent }, "Router classified intent");

      if (intent === "order") {
        logger.debug("Delegating to OrderAgent");
        return orderAgent.handle(userId, conversationId, message);
      }

      if (intent === "billing") {
        logger.debug("Delegating to BillingAgent");
        return billingAgent.handle(userId, conversationId, message);
      }

      logger.debug("Delegating to SupportAgent");
      return supportAgent.handle(conversationId, message);
    } catch (err) {
      logger.error(
        { err, userId, conversationId, message },
        "RouterAgent failed",
      );
      throw err;
    }
  },
};
