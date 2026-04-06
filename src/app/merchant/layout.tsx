"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import logo from "@/src/assets/images/newturbifylogo.png";
import ProfileDropdown from "@/src/components/auth/ProfileDropdown";

const navItems = [
  {
    label: "Dashboard",
    href: "/merchant/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Products",
    href: "/merchant/products",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 6l7-4 7 4v8l-7 4-7-4V6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 10V18M10 10L3 6M10 10l7-4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-body)] flex flex-col">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-[var(--border-default)] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-[var(--radius-sm)] hover:bg-[var(--neutral-100)] transition-colors text-[var(--text-secondary)]"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <Image src={logo} alt="Turbify" className="w-28 h-auto" priority />
        </div>

        <ProfileDropdown />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 md:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed md:static top-16 left-0 bottom-0 z-20
            w-60 bg-white border-r border-[var(--border-default)]
            flex flex-col
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <nav className="p-3 flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)]
                    text-sm font-medium
                    transition-all duration-200
                    group relative
                    ${
                      isActive
                        ? "bg-[var(--primary-50)] text-[var(--primary-700)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--neutral-100)] hover:text-[var(--text-primary)]"
                    }
                  `}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--primary-600)]" />
                  )}
                  <span className={isActive ? "text-[var(--primary-600)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="p-3 border-t border-[var(--border-default)]">
            <div className="px-3 py-2 text-xs text-[var(--text-muted)]">
              Turbify Merchant Portal
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
