type Props = {
  role: "user" | "assistant";
  content: string;
};

export default function MessageBubble({ role, content }: Props) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm leading-relaxed
          ${
            isUser
              ? "bg-blue-600 text-white rounded-br-md"
              : "bg-neutral-800 text-neutral-200 rounded-bl-md"
          }`}
      >
        {content}
      </div>
    </div>
  );
}
