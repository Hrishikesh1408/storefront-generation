"use client";

import Image from "next/image";
import logo from "@/src/assets/images/newturbifylogo.png";

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-[var(--bg-body)] flex flex-col">
      {/* Header */}
      <header className="h-16 flex items-center px-4 md:px-8 border-b border-[var(--border-default)] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <Image src={logo} alt="Turbify" className="w-28 h-auto" priority />
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md animate-slide-up">
          <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-[var(--primary-50)] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[var(--primary-600)]">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Welcome to Turbify
          </h1>
          <p className="text-[var(--text-muted)] leading-relaxed">
            Your dashboard is being prepared. You&apos;ll be able to manage your
            storefront experience from here.
          </p>
        </div>
      </main>
    </div>
  );
}
