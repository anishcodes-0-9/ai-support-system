import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { chatRoutes } from "./routes/chat.routes.js";
import { agentRoutes } from "./routes/agent.routes.js";

const app = new Hono();

app.get("/api/health", (c) => c.json({ status: "ok" }));

app.route("/api/chat", chatRoutes);
app.route("/api/agents", agentRoutes);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
