"use client";

import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/Button/ButtonComponent";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--bg-body)] flex items-center justify-center px-6">
      <div className="text-center max-w-md animate-slide-up">
        {/* Shield icon */}
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-[var(--danger)]">
            <path
              d="M20 4L6 10v8c0 8.5 6 16.5 14 18 8-1.5 14-9.5 14-18v-8L20 4z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M15 18l10-0M15 22l10 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="20" cy="15" r="1.5" fill="currentColor" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Access Denied
        </h1>
        <p className="text-[var(--text-muted)] mb-8 leading-relaxed">
          You don&apos;t have permission to access this page. Please contact your
          administrator or sign in with a different account.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => router.push("/")} variant="primary">
            Go to Home
          </Button>
          <Button onClick={() => router.push("/user/signin")} variant="secondary">
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
