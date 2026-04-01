"use client";

interface TextareaProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  error?: string;
  rows?: number;
  disabled?: boolean;
}

export default function Textarea({
  name,
  value,
  onChange,
  placeholder = "",
  className = "",
  label,
  error,
  rows = 3,
  disabled = false,
}: TextareaProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`
          w-full
          bg-white
          border border-[var(--border-default)]
          rounded-[var(--radius-sm)]
          text-[var(--text-primary)]
          placeholder:text-[var(--text-muted)]
          focus-ring
          transition-all duration-200
          resize-none
          px-3.5 py-2.5 text-sm
          disabled:bg-[var(--neutral-100)] disabled:cursor-not-allowed disabled:opacity-60
          ${error ? "border-[var(--danger)]" : ""}
        `}
      />
      {error && (
        <p className="mt-1.5 text-sm text-[var(--danger)] animate-slide-down">
          {error}
        </p>
      )}
    </div>
  );
}
