import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { chatRoutes } from "./routes/chat.routes.js";
import { agentRoutes } from "./routes/agent.routes.js";
import { rateLimit } from "./middleware/rateLimit.middleware.js";
import { requestId } from "./middleware/requestId.middleware.js";
import { AppError } from "./lib/AppError.js";
import { logger } from "./lib/logger.js";

type Variables = {
  requestId: string;
  startTime: number;
};

const app = new Hono<{ Variables: Variables }>();

// 1️⃣ Attach request ID first
app.use("*", requestId);

// 2️⃣ Apply rate limiting BEFORE routes
app.use("/api/*", rateLimit);
app.route("/api/chat", chatRoutes);
app.route("/api/agents", agentRoutes);

// 3️⃣ Request duration tracking
app.use("*", async (c, next) => {
  const start = Date.now();

  await next();

  const durationMs = Date.now() - start;
  const status = c.res.status;
  const requestId = c.get("requestId");

  if (durationMs > 2000) {
    logger.warn(
      {
        requestId,
        method: c.req.method,
        path: c.req.path,
        status,
        durationMs,
      },
      "Slow request detected",
    );
  } else {
    logger.info(
      {
        requestId,
        method: c.req.method,
        path: c.req.path,
        status,
        durationMs,
      },
      "Request completed",
    );
  }
});

// 4️⃣ Routes AFTER middleware
// Health check
app.get("/api/health", (c) => {
  return c.json({
    success: true,
    data: { status: "ok" },
    requestId: c.get("requestId"),
  });
});

// Routes
app.route("/api/chat", chatRoutes);
app.route("/api/agents", agentRoutes);

app.onError((err: any, c) => {
  const requestId = c.get("requestId");

  const statusCode = err instanceof AppError ? err.statusCode : 500;

  logger.error(
    {
      requestId,
      message: err.message,
      statusCode,
    },
    "Operational error",
  );

  return c.json(
    {
      success: false,
      error: err.message ?? "Internal Server Error",
      requestId,
    },
    statusCode as 400 | 401 | 403 | 404 | 429 | 500,
  );
});
// Start server
// Start server
const server = serve({
  fetch: app.fetch,
  port: 3000,
});

logger.info("Server is running on http://localhost:3000");

// Graceful shutdown
function shutdown(signal: string) {
  logger.warn({ signal }, "Shutting down server...");

  server.close(() => {
    logger.info("Server closed successfully");
    process.exit(0);
  });

  // Force exit if something hangs
  setTimeout(() => {
    logger.error("Force exiting process");
    process.exit(1);
  }, 10000);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
