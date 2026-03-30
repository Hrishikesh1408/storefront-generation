"use client";

interface SelectProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export default function Select({
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  size = "md",
  className = "",
  label,
  error,
  disabled = false,
}: SelectProps) {
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
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full appearance-none
            bg-white
            border border-[var(--border-default)]
            rounded-[var(--radius-sm)]
            text-[var(--text-primary)]
            focus-ring
            transition-all duration-200
            pr-10
            disabled:bg-[var(--neutral-100)] disabled:cursor-not-allowed disabled:opacity-60
            ${!value ? "text-[var(--text-muted)]" : ""}
            ${error ? "border-[var(--danger)]" : ""}
            ${sizeStyles[size]}
          `}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Chevron icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-[var(--danger)] animate-slide-down">
          {error}
        </p>
      )}
    </div>
  );
}
