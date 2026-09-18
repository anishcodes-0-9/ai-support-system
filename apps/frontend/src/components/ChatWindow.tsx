import { useState } from "react";
import type { Message, OrderData } from "../types";
import Header from "./Header";
import MessageList from "./MessageList";
import EmptyState from "./EmptyState";
import Composer from "./Composer";

const DEFAULT_ERROR_MESSAGE =
  "Sorry, I couldn't process that request. Please try again.";

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (override?: string) => {
    const trimmed = (override ?? input).trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { role: "user", content: trimmed };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setIsThinking(true);
    setError(null);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "4b200b02-1798-4d8a-9619-fb08176e4962",
          message: trimmed,
          ...(conversationId ? { conversationId } : {}),
        }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        console.error("Chat request failed", errorBody);
        setError(errorBody?.error ?? DEFAULT_ERROR_MESSAGE);
        return;
      }

      const returnedConversationId = res.headers.get("X-Conversation-Id");
      if (returnedConversationId && returnedConversationId !== conversationId) {
        setConversationId(returnedConversationId);
      }

      let orderData: OrderData | undefined;
      const rawOrderData = res.headers.get("x-order-data");
      if (rawOrderData) {
        try {
          orderData = JSON.parse(rawOrderData);
        } catch {
          orderData = undefined;
        }
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let firstChunkReceived = false;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          fullText += decoder.decode(value, { stream: true });

          if (!firstChunkReceived) {
            firstChunkReceived = true;
            setIsThinking(false);
          }

          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];

            if (last?.role === "assistant") {
              last.content = fullText;
            } else {
              updated.push({ role: "assistant", content: fullText, orderData });
            }

            return [...updated];
          });
        }
      }
    } catch (err) {
      console.error(err);
      setError(DEFAULT_ERROR_MESSAGE);
    } finally {
      setLoading(false);
      setIsThinking(false);
    }
  };

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-neutral-900 sm:h-[80vh] sm:max-h-[760px] sm:w-[600px] sm:rounded-2xl sm:border sm:border-neutral-800 sm:shadow-2xl lg:h-[85vh] lg:max-h-[860px] lg:w-[760px]">
      <Header />

      {messages.length === 0 ? (
        <EmptyState onSelect={(prompt) => sendMessage(prompt)} />
      ) : (
        <MessageList messages={messages} isThinking={isThinking} />
      )}

      {error && (
        <div className="px-4 py-2 text-sm text-red-400 border-t border-neutral-800">
          {error}
        </div>
      )}

      <Composer
        value={input}
        onChange={setInput}
        onSubmit={() => sendMessage()}
        disabled={loading}
      />
    </div>
  );
}
