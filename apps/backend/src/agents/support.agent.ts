import { streamText, tool } from "ai";
import { z } from "zod";
import { openai } from "../lib/ai.js";
import { supportTools } from "../tools/support.tools.js";

type SupportToolInput = {
  conversationId: string;
};

type SupportToolOutput = {
  role: string;
  content: string;
}[];

export const supportAgent = {
  async handle(conversationId: string, message: string) {
    return streamText({
      model: openai("gpt-4o-mini"),

      system: `
You are a General Support Agent.
Help users with general issues and troubleshooting.
Respond conversationally.
Use conversation history if needed.
`,

      messages: [
        {
          role: "user",
          content: message,
        },
      ],

      tools: {
        getConversationHistory: tool<SupportToolInput, SupportToolOutput>({
          description: "Fetch conversation history",
          inputSchema: z.object({
            conversationId: z.string(),
          }),
          execute: async ({ conversationId }) => {
            return supportTools.getConversationHistory(conversationId);
          },
        }),
      },
    });
  },
};
