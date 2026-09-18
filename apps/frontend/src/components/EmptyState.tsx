const SUGGESTIONS = [
  "Where is my latest order?",
  "Track an order",
  "What can you help me with?",
  "Help with a billing issue",
];

export default function EmptyState({
  onSelect,
}: {
  onSelect: (prompt: string) => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <h2 className="text-base font-medium text-neutral-100">
          How can I help?
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Ask about an order, a tracking number, or a billing question.
        </p>
      </div>

      <div className="grid w-full max-w-sm grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelect(prompt)}
            className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-left text-sm text-neutral-300 transition-colors hover:border-neutral-700 hover:bg-neutral-800"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
