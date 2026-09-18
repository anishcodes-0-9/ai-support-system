import { describe, it, expect, vi } from "vitest";
import { orderRepository } from "../repositories/order.repository.js";
import { orderTools } from "./order.tools.js";

vi.mock("../repositories/order.repository.js", () => ({
  orderRepository: {
    getOrdersByUser: vi.fn(),
    getOrderById: vi.fn(),
    getLatestOrder: vi.fn(),
    getOrderByTrackingNumber: vi.fn(),
  },
}));

describe("orderTools.getOrderByTrackingNumber", () => {
  it("returns the order when the repository finds one", async () => {
    const fakeOrder = { id: "order-1", productName: "Widget" };
    vi.mocked(orderRepository.getOrderByTrackingNumber).mockResolvedValue(
      fakeOrder as any,
    );

    const result = await orderTools.getOrderByTrackingNumber("TRK123456");

    expect(result).toEqual(fakeOrder);
    expect(orderRepository.getOrderByTrackingNumber).toHaveBeenCalledWith(
      "TRK123456",
    );
  });

  it("returns null when no order is found, without fabricating one", async () => {
    vi.mocked(orderRepository.getOrderByTrackingNumber).mockResolvedValue(
      null,
    );

    const result = await orderTools.getOrderByTrackingNumber("TRK000000");

    expect(result).toBeNull();
  });
});

describe("orderTools.fetchOrderDetails", () => {
  it("returns a structured error when the order does not exist", async () => {
    vi.mocked(orderRepository.getOrderById).mockResolvedValue(null);

    const result = await orderTools.fetchOrderDetails("missing-id");

    expect(result).toEqual({ error: "Order not found" });
  });
});

describe("orderTools.listUserOrders", () => {
  it("delegates the userId to the repository", async () => {
    vi.mocked(orderRepository.getOrdersByUser).mockResolvedValue([]);

    await orderTools.listUserOrders("user-1");

    expect(orderRepository.getOrdersByUser).toHaveBeenCalledWith("user-1");
  });
});
