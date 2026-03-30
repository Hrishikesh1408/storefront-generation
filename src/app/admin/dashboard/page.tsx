"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import logo from "@/src/assets/images/newturbifylogo.png";
import Input from "@/src/components/ui/TextInput/InputComponent";
import Button from "@/src/components/ui/Button/ButtonComponent";
import Badge from "@/src/components/ui/Badge/Badge";
import Spinner from "@/src/components/ui/Spinner/Spinner";
import UserRoleModal from "@/src/components/admin/UserRoleModal";
import StoreDetailsModal from "@/src/components/admin/StoreDetailsModal";

export default function AdminDashboard() {
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [selectedStoreUser, setSelectedStoreUser] = useState<any>(null);

  const fetchUsers = async (email?: string) => {
    setLoading(true);
    try {
      const url = email
        ? `/api/user?email=${encodeURIComponent(email)}`
        : `/api/user`;
      const res = await fetch(url);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = () => fetchUsers(email);

  const openModal = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const openStoreModal = (user: any) => {
    setSelectedStoreUser(user);
    setIsStoreModalOpen(true);
  };

  const closeStoreModal = () => {
    setSelectedStoreUser(null);
    setIsStoreModalOpen(false);
  };

  const handleRoleUpdate = (updatedUser: any) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "info" as const;
      case "merchant": return "success" as const;
      default: return "neutral" as const;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-body)] flex flex-col">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-[var(--border-default)] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <Image src={logo} alt="Turbify" className="w-28 h-auto" priority />
        <div className="flex items-center gap-3">
          <Badge variant="info" dot>Admin</Badge>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            User Management
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Search, manage roles, and view merchant store details
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-6 animate-slide-up">
          <Input
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Search by email address..."
            size="md"
            clearable
            onClear={() => {
              setEmail("");
              fetchUsers();
            }}
          />
          <Button onClick={handleSearch} variant="primary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Search
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[var(--radius-md)] border border-[var(--border-default)] shadow-[var(--shadow-sm)] overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--neutral-50)] border-b border-[var(--border-default)]">
                  <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">UID</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)] w-28">Store</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12">
                      <Spinner />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[var(--text-muted)]">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-[var(--neutral-50)] transition-colors"
                    >
                      <td className="px-4 py-3 text-[var(--text-muted)] font-mono text-xs">
                        {user.id?.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-[var(--text-primary)]">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-primary)]">
                        {user.name || <span className="text-[var(--text-muted)]">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => user.role !== "admin" && openModal(user)}
                          disabled={user.role === "admin"}
                          className="disabled:cursor-default"
                        >
                          <Badge
                            variant={getRoleBadgeVariant(user.role)}
                            dot
                            className={user.role !== "admin" ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
                          >
                            {user.role || "N/A"}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        {user.role === "merchant" && (
                          <button
                            onClick={() => openStoreModal(user)}
                            className="text-[var(--primary-600)] hover:text-[var(--primary-700)] text-sm font-medium transition-colors"
                          >
                            View Store
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        <UserRoleModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={closeModal}
          onSaveSuccess={handleRoleUpdate}
        />
        <StoreDetailsModal
          userId={selectedStoreUser?.id || null}
          isOpen={isStoreModalOpen}
          onClose={closeStoreModal}
        />
      </main>
    </div>
  );
}
