import type { OrderData } from "../types";

function formatDate(value: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toDateString();
}

function statusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("delivered")) return "bg-emerald-500/15 text-emerald-400";
  if (normalized.includes("transit") || normalized.includes("shipped"))
    return "bg-blue-500/15 text-blue-400";
  if (normalized.includes("cancel") || normalized.includes("fail"))
    return "bg-red-500/15 text-red-400";
  return "bg-neutral-700/50 text-neutral-300";
}

export default function OrderCard({ data }: { data: OrderData }) {
  return (
    <div className="w-full text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-neutral-100">{data.productName}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusTone(
            data.status,
          )}`}
        >
          {data.status}
        </span>
      </div>

      <dl className="mt-2 space-y-1 text-neutral-400">
        {data.trackingNumber && (
          <div className="flex justify-between gap-4">
            <dt>Tracking</dt>
            <dd className="text-neutral-200">{data.trackingNumber}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt>Delivery status</dt>
          <dd className="text-neutral-200">
            {data.deliveryStatus ?? "Not available"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Estimated delivery</dt>
          <dd className="text-neutral-200">
            {formatDate(data.estimatedDeliveryDate)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
