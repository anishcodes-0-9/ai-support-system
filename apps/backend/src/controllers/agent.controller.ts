import type { Context } from "hono";

export const agentController = {
  listAgents(c: Context) {
    return c.json([
      { type: "support" },
      { type: "order" },
      { type: "billing" },
    ]);
  },

  getCapabilities(c: Context) {
    const type = c.req.param("type");

    const capabilities: Record<string, string[]> = {
      support: ["conversation history", "general support"],
      order: ["fetch order details", "track delivery"],
      billing: ["invoice details", "refund status"],
    };

    return c.json({
      type,
      capabilities: capabilities[type] || [],
    });
  },
};
