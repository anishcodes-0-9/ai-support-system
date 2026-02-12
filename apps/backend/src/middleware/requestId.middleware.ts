import { v4 as uuidv4 } from "uuid";
import type { Context, Next } from "hono";

export async function requestId(c: Context, next: Next) {
  const id = uuidv4();

  // Attach to context
  c.set("requestId", id);

  // Attach to response header
  c.header("x-request-id", id);

  await next();
}
