import { useState } from "react";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, `You: ${message}`]);

    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "4b200b02-1798-4d8a-9619-fb08176e4962",
        message,
      }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let aiResponse = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiResponse += decoder.decode(value);
      }
    }

    setMessages((prev) => [...prev, `AI: ${aiResponse}`]);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white p-6">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className="bg-gray-800 p-3 rounded-lg">
            {msg}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 p-3 rounded bg-gray-900 border border-gray-700"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
