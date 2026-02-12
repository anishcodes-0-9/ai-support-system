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

// ⏱ Timeout helper
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("LLM_TIMEOUT"));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export const routerAgent = {
  async route(userId: string, conversationId: string, message: string) {
    logger.info({ userId, conversationId, message }, "Router received message");

    try {
      // ⏱ Timeout protected intent classification
      const { object } = await withTimeout(
        generateObject({
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
        }),
        8000, // 8 second timeout
      );

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
    } catch (err: any) {
      if (err.message === "LLM_TIMEOUT") {
        logger.error("Intent classification timeout");

        // Fallback to support agent
        return supportAgent.handle(conversationId, message);
      }

      logger.error({ err }, "Router failed unexpectedly");

      // Safe fallback
      return supportAgent.handle(conversationId, message);
    }
  },
};
