"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface UserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
  role: string;
}

interface ProfileDropdownProps {
  /** Optional extra class names for the root wrapper */
  className?: string;
}

export default function ProfileDropdown({ className = "" }: ProfileDropdownProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user info from JWT cookie
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setEditName(data.user.name);
        }
      })
      .catch(console.error);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setEditing(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.push("/user/signin");
    } catch (err) {
      console.error("Signout error:", err);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setEditing(false);
      }
    } catch (err) {
      console.error("Profile update error:", err);
    }
    setSaving(false);
  };

  const initials = user?.name
    ? user.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "?";

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) setEditing(false);
        }}
        className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-[var(--primary-400)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-400)] focus:ring-offset-2 cursor-pointer"
        aria-label="Profile menu"
        id="profile-avatar-btn"
      >
        {user?.picture ? (
          <img
            src={user.picture}
            alt={user.name || "Profile"}
            className="w-10 h-10 object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full gradient-primary flex items-center justify-center">
            <span className="text-white text-xs font-semibold">{initials}</span>
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-72 bg-white rounded-[var(--radius-md)] border border-[var(--border-default)] shadow-[var(--shadow-lg)] animate-slide-down z-50 overflow-hidden"
          id="profile-dropdown"
        >
          {/* User Info Header */}
          <div className="px-4 py-4 border-b border-[var(--border-default)] bg-[var(--bg-subtle)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[var(--border-default)]">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || "Profile"}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full gradient-primary flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">{initials}</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  {user?.name || "Unknown"}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Profile Section */}
          {editing ? (
            <div className="px-4 py-3 border-b border-[var(--border-default)]">
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--border-default)] rounded-[var(--radius-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-400)] focus:border-[var(--border-focus)] transition-all"
                placeholder="Your name"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveProfile();
                  if (e.key === "Escape") setEditing(false);
                }}
              />
              <div className="flex gap-2 mt-2.5">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !editName.trim()}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-[var(--primary-600)] hover:bg-[var(--primary-700)] rounded-[var(--radius-sm)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditName(user?.name || "");
                  }}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--neutral-100)] rounded-[var(--radius-sm)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="py-1">
              {/* Edit Profile Option */}
              <button
                onClick={() => setEditing(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--neutral-100)] hover:text-[var(--text-primary)] transition-colors"
                id="edit-profile-btn"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path
                    d="M8 8a3 3 0 100-6 3 3 0 000 6zM14 14c0-2.21-2.686-4-6-4s-6 1.79-6 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Edit Profile
              </button>

              {/* Divider */}
              <div className="mx-3 border-t border-[var(--border-default)]" />

              {/* Sign Out Option */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--danger)] hover:bg-red-50 transition-colors"
                id="signout-btn"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path
                    d="M6 14H3.333A1.333 1.333 0 012 12.667V3.333A1.333 1.333 0 013.333 2H6M10.667 11.333L14 8l-3.333-3.333M14 8H6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
