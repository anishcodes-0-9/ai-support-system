import type { Context, Next } from "hono";

const WINDOW_MS = 10_000; // 10 seconds (temporary for testing)
const MAX_REQUESTS = 5; // 5 requests max (temporary for testing)

const requestCounts = new Map<string, { count: number; timestamp: number }>();

// 🧹 Cleanup stale IPs every window
setInterval(() => {
  const now = Date.now();

  for (const [ip, entry] of requestCounts.entries()) {
    if (now - entry.timestamp > WINDOW_MS) {
      requestCounts.delete(ip);
    }
  }
}, WINDOW_MS);

export async function rateLimit(c: Context, next: Next) {
  const forwarded = c.req.header("x-forwarded-for");
  const ip = forwarded?.split(",")[0].trim() ?? "local";

  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return next();
  }

  if (now - entry.timestamp > WINDOW_MS) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return next();
  }
  console.log("RateLimit Debug -> IP:", ip, "Count:", entry.count);
  if (entry.count >= MAX_REQUESTS) {
    return c.json({ error: "Too many requests" }, 429);
  }

  entry.count += 1;
  return next();
}
