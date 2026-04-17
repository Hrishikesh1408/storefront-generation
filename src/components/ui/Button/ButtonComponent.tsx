"use client";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  fullWidth = false,
}: ButtonProps) {
  const sizeStyles = {
    sm: "px-4 py-2 text-sm gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  const variantStyles = {
    primary:
      "bg-[var(--primary-600)] text-white shadow-sm hover:bg-[var(--primary-700)] active:bg-[var(--primary-800)] focus:ring-[var(--primary-200)]",
    secondary:
      "bg-white text-[var(--text-primary)] border border-[var(--border-default)] shadow-sm hover:bg-[var(--neutral-50)] hover:border-[var(--border-hover)] active:bg-[var(--neutral-100)] focus:ring-[var(--neutral-200)]",
    ghost:
      "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--neutral-100)] hover:text-[var(--text-primary)] active:bg-[var(--neutral-200)] focus:ring-[var(--neutral-200)]",
    danger:
      "bg-[var(--danger)] text-white shadow-sm hover:bg-red-600 active:bg-red-700 focus:ring-red-200",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center
        font-medium
        rounded-[var(--radius-sm)]
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading && (
        <svg
          className="animate-spin-slow h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
