import { openai as createOpenAI } from "@ai-sdk/openai";

const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";

export const openai = (model?: string) => createOpenAI(model || modelName);
