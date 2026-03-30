import Button from "@/src/components/ui/Button/ButtonComponent";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  loading = false,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in">
      {icon ? (
        <div className="mb-5 text-[var(--text-muted)]">{icon}</div>
      ) : (
        <div className="mb-5">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            className="text-[var(--neutral-300)]"
          >
            <rect
              x="8"
              y="12"
              width="48"
              height="40"
              rx="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            <circle cx="24" cy="28" r="4" stroke="currentColor" strokeWidth="2" />
            <path
              d="M8 42l12-8 8 6 12-10 16 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--text-muted)] max-w-sm text-center mb-6">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} loading={loading}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
