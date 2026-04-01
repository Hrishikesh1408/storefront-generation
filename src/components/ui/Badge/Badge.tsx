type BadgeVariant = "success" | "warning" | "info" | "neutral" | "danger";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

export default function Badge({
  children,
  variant = "neutral",
  dot = false,
  className = "",
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    success: "bg-[var(--success-light)] text-emerald-700",
    warning: "bg-[var(--warning-light)] text-amber-700",
    info: "bg-[var(--info-light)] text-blue-700",
    neutral: "bg-[var(--neutral-100)] text-[var(--text-secondary)]",
    danger: "bg-[var(--danger-light)] text-red-700",
  };

  const dotColors: Record<BadgeVariant, string> = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    info: "bg-blue-500",
    neutral: "bg-[var(--neutral-400)]",
    danger: "bg-red-500",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1
        text-xs font-semibold
        rounded-[var(--radius-full)]
        uppercase tracking-wide
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}
