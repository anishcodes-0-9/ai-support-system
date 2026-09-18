export type OrderData = {
  productName: string;
  status: string;
  deliveryStatus: string | null;
  estimatedDeliveryDate: string | null;
  trackingNumber: string | null;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
  orderData?: OrderData;
};
