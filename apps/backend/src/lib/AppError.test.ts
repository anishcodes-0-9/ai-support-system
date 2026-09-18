import { describe, it, expect } from "vitest";
import {
  AppError,
  ValidationError,
  NotFoundError,
  ServiceUnavailableError,
} from "./AppError.js";

describe("AppError hierarchy", () => {
  it("defaults to statusCode 500", () => {
    const err = new AppError("something broke");
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(true);
  });

  it("ValidationError uses statusCode 400", () => {
    expect(new ValidationError("bad input").statusCode).toBe(400);
  });

  it("NotFoundError uses statusCode 404", () => {
    expect(new NotFoundError("missing").statusCode).toBe(404);
  });

  it("ServiceUnavailableError uses statusCode 503", () => {
    expect(new ServiceUnavailableError("router down").statusCode).toBe(503);
  });

  it("preserves the message on each subclass", () => {
    expect(new NotFoundError("User not found").message).toBe(
      "User not found",
    );
  });
});
