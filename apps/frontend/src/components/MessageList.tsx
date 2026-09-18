import { useEffect, useRef } from "react";
import type { Message } from "../types";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function MessageList({
  messages,
  isThinking,
}: {
  messages: Message[];
  isThinking: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
      {messages.map((msg, index) => (
        <MessageBubble
          key={index}
          role={msg.role}
          content={msg.content}
          orderData={msg.orderData}
        />
      ))}
      {isThinking && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
