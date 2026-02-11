import type { Context, Next } from "hono";

const requestCounts = new Map<string, { count: number; timestamp: number }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute

export async function rateLimit(c: Context, next: Next) {
  // Prefer forwarded IP if behind proxy
  const forwarded = c.req.header("x-forwarded-for");

  const ip = forwarded?.split(",")[0].trim() ?? "local";

  const now = Date.now();

  const entry = requestCounts.get(ip);

  if (!entry) {
    requestCounts.set(ip, {
      count: 1,
      timestamp: now,
    });
    return next();
  }

  if (now - entry.timestamp > WINDOW_MS) {
    requestCounts.set(ip, {
      count: 1,
      timestamp: now,
    });
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    return c.json({ error: "Too many requests" }, 429);
  }

  entry.count += 1;
  return next();
}
