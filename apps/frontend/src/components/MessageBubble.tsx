import ReactMarkdown from "react-markdown";
import type { Message } from "../types";
import OrderCard from "./OrderCard";

export default function MessageBubble({ role, content, orderData }: Message) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] overflow-hidden rounded-2xl text-sm leading-relaxed sm:max-w-[70%]
          ${
            isUser
              ? "bg-blue-600 text-white rounded-br-md"
              : "bg-neutral-800 text-neutral-200 rounded-bl-md"
          }`}
      >
        <div className="px-4 py-2">
          {isUser ? (
            content
          ) : (
            <div className="markdown-content">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>

        {orderData && (
          <div className="border-t border-neutral-700/60 px-4 py-3">
            <OrderCard data={orderData} />
          </div>
        )}
      </div>
    </div>
  );
}
