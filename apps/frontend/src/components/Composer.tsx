import { useEffect, useRef } from "react";

const MAX_HEIGHT_PX = 160;

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
};

export default function Composer({ value, onChange, onSubmit, disabled }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t border-neutral-800 p-3 sm:p-4">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about orders, tracking numbers, or delivery..."
        rows={1}
        disabled={disabled}
        className="flex-1 resize-none rounded-xl bg-neutral-800 px-4 py-2 text-white placeholder:text-neutral-500 outline-none disabled:opacity-60"
        style={{ maxHeight: MAX_HEIGHT_PX }}
      />

      <button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className="rounded-xl bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
}
