import { streamText } from "ai";
import { openai } from "../lib/ai.js";
import { supportTools } from "../tools/support.tools.js";

export const supportAgent = {
  async handle(conversationId: string, message: string) {
    // 1️⃣ Fetch conversation history
    const history = await supportTools.getConversationHistory(conversationId);

    // 2️⃣ Stream conversational response
    return streamText({
      model: openai("gpt-4o-mini"),

      system: `
You are a General Support Agent.
Use the provided conversation history to respond helpfully.
Respond conversationally.
`,

      messages: [
        {
          role: "system",
          content: `Conversation history: ${JSON.stringify(history)}`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });
  },
};
