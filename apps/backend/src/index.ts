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

// Minimal Frontend
app.get("/", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>AI Support Chat</title>
      <style>
        body { font-family: Arial; max-width: 700px; margin: 40px auto; }
        #chat { 
          border: 1px solid #ccc; 
          padding: 10px; 
          height: 400px; 
          overflow-y: auto; 
          background: #fafafa;
        }
        .user { margin: 8px 0; }
        .ai { margin: 8px 0; color: #333; }
        input { width: 75%; padding: 8px; }
        button { padding: 8px 12px; }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
      </style>
    </head>
    <body>
      <h2>AI Support Chat</h2>

      <div id="chat"></div>
      <br/>
      <input id="message" placeholder="Ask something..." />
      <button id="sendBtn">Send</button>

      <script>
        const userId = "4b200b02-1798-4d8a-9619-fb08176e4962";
        const conversationId = "f2f07ddb-7a49-42de-982a-951556975f16";

        const chat = document.getElementById("chat");
        const input = document.getElementById("message");
        const sendBtn = document.getElementById("sendBtn");

        function appendMessage(className, label, text) {
          const div = document.createElement("div");
          div.className = className;
          div.innerHTML = "<b>" + label + ":</b> " + text;
          chat.appendChild(div);
          chat.scrollTop = chat.scrollHeight;
          return div;
        }

        async function send() {
          const message = input.value.trim();
          if (!message) return;

          // Clear input immediately
          input.value = "";

          // Disable button
          sendBtn.disabled = true;

          appendMessage("user", "You", message);

          try {
            const response = await fetch("/api/chat/messages", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId,
                conversationId,
                message
              })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let fullText = "";
            const aiDiv = appendMessage("ai", "AI", "");

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              fullText += chunk;
              aiDiv.innerHTML = "<b>AI:</b> " + fullText;

              // Auto scroll during streaming
              chat.scrollTop = chat.scrollHeight;
            }

          } catch (err) {
            appendMessage("ai", "AI", "Something went wrong.");
            console.error(err);
          } finally {
            sendBtn.disabled = false;
          }
        }

        sendBtn.addEventListener("click", send);
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") send();
        });
      </script>
    </body>
    </html>
  `);
});

// Routes
app.route("/api/chat", chatRoutes);
app.route("/api/agents", agentRoutes);

app.onError((err, c) => {
  const requestId = c.get("requestId");

  if (err instanceof AppError) {
    logger.warn(
      { requestId, message: err.message, statusCode: err.statusCode },
      "Operational error",
    );

    return c.json(
      {
        success: false,
        error: err.message,
        requestId,
      },
      err.statusCode as any, // 👈 important
    );
  }

  logger.error({ requestId, err }, "Unexpected system error");

  return c.json(
    {
      success: false,
      error: "Internal Server Error",
      requestId,
    },
    500,
  );
});

// Start server
serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
