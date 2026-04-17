"use client";

interface InputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  clearable?: boolean;
  onClear?: () => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export default function Input({
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  size = "md",
  className = "",
  clearable = false,
  onClear,
  label,
  error,
  disabled = false,
}: InputProps) {
  const sizeStyles = {
    sm: "px-3 py-2 text-sm",
    md: "px-3.5 py-2.5 text-sm",
    lg: "px-4 py-3 text-base",
  };

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
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
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
            disabled:bg-[var(--neutral-100)] disabled:cursor-not-allowed disabled:opacity-60
            ${error ? "border-[var(--danger)] focus:border-[var(--danger)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]" : ""}
            ${sizeStyles[size]}
            ${clearable && value ? "pr-9" : ""}
          `}
        />
        {clearable && value && (
          <button
            type="button"
            onClick={() => {
              onChange({ target: { value: "" } } as any);
              onClear?.();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-[var(--danger)] animate-slide-down">
          {error}
        </p>
      )}
    </div>
  );
}
