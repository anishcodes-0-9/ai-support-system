import { randomUUID } from "crypto";
import type { Context, Next } from "hono";

export const requestId = async (c: Context, next: Next) => {
  const id = randomUUID();

  c.set("requestId", id);
  c.set("startTime", Date.now());

  c.header("x-request-id", id);

  await next();
};
