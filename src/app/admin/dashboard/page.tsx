"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import logo from "@/src/assets/images/newturbifylogo.png";
import Input from "@/src/components/ui/TextInput/InputComponent";
import Button from "@/src/components/ui/Button/ButtonComponent";
import UserRoleModal from "@/src/components/admin/UserRoleModal";

export default function Page() {
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // ================= FETCH USERS =================
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

  // ================= LOAD ON PAGE OPEN =================
  useEffect(() => {
    fetchUsers(); // 🔥 latest 10 users
  }, []);

  // ================= SEARCH =================
  const handleSearch = () => {
    fetchUsers(email);
  };

  // ================= MODAL =================
  const openModal = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  // ================= UPDATE ROLE =================
  const handleRoleUpdate = (updatedUser: any) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="h-20 flex items-center px-20">
        <Image src={logo} alt="Turbify Logo" className="w-32 h-auto" priority />
      </header>

      {/* ================= MAIN ================= */}
      <main className="flex flex-col py-10 mx-15 px-5 bg-white">
        {/* ================= SEARCH BAR ================= */}
        <div className="flex gap-4 mb-6">
          <Input
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Search user by email"
            size="sm"
            clearable
            onClear={() => {
              setEmail("");
              fetchUsers(); // 🔥 reset to latest users
            }}
          />

          <Button onClick={handleSearch} size="sm">
            Search
          </Button>
        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-xs border border-gray-300">
            <thead>
              <tr className="bg-gray-200 font-semibold">
                <th className="p-2 text-left">UID</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Role</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="bg-gray-50 border-t">
                    <td className="p-2">{user.id}</td>

                    <td className="p-2">{user.email}</td>

                    <td className="p-2">{user.name || "N/A"}</td>

                    <td className="p-2">
                      <button
                        onClick={() => user.role !== "admin" && openModal(user)}
                        disabled={user.role === "admin"}
                        className={`${
                          user.role === "admin"
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-blue-600 hover:text-blue-800"
                        }`}
                      >
                        {user.role || "N/A"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================= MODAL ================= */}
        <UserRoleModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={closeModal}
          onSaveSuccess={handleRoleUpdate}
        />
      </main>
    </div>
  );
}
