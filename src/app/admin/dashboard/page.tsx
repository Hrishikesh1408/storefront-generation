"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import logo from "@/src/assets/images/newturbifylogo.png";
import Input from "@/src/components/ui/TextInput/InputComponent";
import Button from "@/src/components/ui/Button/ButtonComponent";
import Badge from "@/src/components/ui/Badge/Badge";
import Spinner from "@/src/components/ui/Spinner/Spinner";
import UserRoleModal from "@/src/components/admin/UserRoleModal";
import StoreDetailsModal from "@/src/components/admin/StoreDetailsModal";
import CategoryProductsModal from "@/src/components/admin/CategoryProductsModal";

type Tab = "users" | "stores" | "categories";

export default function Page() {
  const [activeTab, setActiveTab] = useState<Tab>("users");

  // ================= USERS STATE =================
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [selectedStoreUser, setSelectedStoreUser] = useState<any>(null);

  // ================= STORES STATE =================
  const [storeName, setStoreName] = useState("");
  const [stores, setStores] = useState<any[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);

  // ================= CATEGORIES STATE =================
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // ================= FETCH USERS =================
  const fetchUsers = async (searchEmail?: string) => {
    setLoadingUsers(true);
    try {
      const url = searchEmail
        ? `/api/user?email=${encodeURIComponent(searchEmail)}`
        : `/api/user`;
      const res = await fetch(url);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // ================= FETCH STORES =================
  const fetchStores = async (searchName?: string) => {
    setLoadingStores(true);
    try {
      const url = searchName
        ? `/api/admin/stores?name=${encodeURIComponent(searchName)}`
        : `/api/admin/stores`;
      const res = await fetch(url);
      const data = await res.json();
      setStores(data.stores || []);
    } catch (err) {
      console.error("Error fetching stores:", err);
      setStores([]);
    } finally {
      setLoadingStores(false);
    }
  };

  // ================= FETCH CATEGORIES =================
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch("/api/category");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // ================= ADD CATEGORY =================
  const handleAddCategory = async () => {
    if (!newCategoryLabel.trim()) return;
    setAddingCategory(true);
    try {
      const res = await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newCategoryLabel }),
      });
      if (res.ok) {
        setNewCategoryLabel("");
        await fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add category");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding category");
    }
    setAddingCategory(false);
  };

  // ================= DELETE CATEGORY =================
  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/category/${categoryId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchCategories();
      } else {
        alert("Failed to delete category");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting category");
    }
  };

  // ================= LOAD DATA ON TAB SWITCH =================
  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "stores") fetchStores();
    if (activeTab === "categories") fetchCategories();
  }, [activeTab]);

  // CATEGORY POLLING
  useEffect(() => {
    if (activeTab !== "categories") return;
    const interval = setInterval(() => {
      fetch("/api/category")
        .then((res) => res.json())
        .then((data) => {
          if (data.categories) setCategories(data.categories);
        })
        .catch(console.error);
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [activeTab]);

  // ================= MODALS =================
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

  const openCategoryModal = (cat: any) => {
    setSelectedCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setSelectedCategory(null);
    setIsCategoryModalOpen(false);
  };

  const handleRoleUpdate = (updatedUser: any) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  // ================= TAB STYLES =================
  const tabClass = (tab: Tab) =>
    `px-6 py-3 text-sm font-semibold cursor-pointer transition-colors ${activeTab === tab
      ? "text-blue-700 border-b-2 border-blue-700 bg-white"
      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
    }`;

  return (
    <div className="min-h-screen bg-[var(--bg-body)] flex flex-col">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-[var(--border-default)] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <Image src={logo} alt="Turbify" className="w-28 h-auto" priority />
        <div className="flex items-center gap-3">
          <Badge variant="info" dot>Admin</Badge>
        </div>
      </header>

      {/* ================= TABS ================= */}
      <div className="mx-15 flex border-b border-gray-300 bg-gray-50">
        <button className={tabClass("users")} onClick={() => setActiveTab("users")}>
          Users
        </button>
        <button className={tabClass("stores")} onClick={() => setActiveTab("stores")}>
          Stores
        </button>
        <button className={tabClass("categories")} onClick={() => setActiveTab("categories")}>
          Categories
        </button>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex flex-col py-10 mx-15 px-5 bg-white min-h-[500px]">

        {/* ==================== USERS TAB ==================== */}
        {activeTab === "users" && (
          <>
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
                  fetchUsers();
                }}
              />
              <Button onClick={() => fetchUsers(email)} size="sm">
                Search
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-xs border border-gray-300">
                <thead>
                  <tr className="bg-gray-200 font-semibold">
                    <th className="p-2 text-left">UID</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Role</th>
                    <th className="p-2 text-left w-24">Store</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center">Loading...</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">No users found</td>
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
                            className={`${user.role === "admin"
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-blue-600 hover:text-blue-800"
                              }`}
                          >
                            {user.role || "N/A"}
                          </button>
                        </td>
                        <td className="p-2">
                          {user.role === "merchant" && (
                            <button
                              onClick={() => openStoreModal(user)}
                              className="text-blue-600 hover:text-blue-800"
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
          </>
        )}

        {/* ==================== STORES TAB ==================== */}
        {activeTab === "stores" && (
          <>
            <div className="flex gap-4 mb-6">
              <Input
                name="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Search store by name"
                size="sm"
                clearable
                onClear={() => {
                  setStoreName("");
                  fetchStores();
                }}
              />
              <Button onClick={() => fetchStores(storeName)} size="sm">
                Search
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-xs border border-gray-300">
                <thead>
                  <tr className="bg-gray-200 font-semibold">
                    <th className="p-2 text-left">Store ID</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingStores ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center">Loading...</td>
                    </tr>
                  ) : stores.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">No stores found</td>
                    </tr>
                  ) : (
                    stores.map((store) => (
                      <tr key={store._id} className="bg-gray-50 border-t">
                        <td className="p-2 truncate">{store._id}</td>
                        <td className="p-2">{store.name}</td>
                        <td className="p-2 capitalize">{store.category?.replace("_", " ") || "N/A"}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${store.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {store.status || "draft"}
                          </span>
                        </td>
                        <td className="p-2">
                          {store.created_at
                            ? new Date(store.created_at).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ==================== CATEGORIES TAB ==================== */}
        {activeTab === "categories" && (
          <>
            <div className="flex gap-4 mb-6">
              <Input
                name="newCategory"
                value={newCategoryLabel}
                onChange={(e) => setNewCategoryLabel(e.target.value)}
                placeholder="Enter category name (e.g. Home Decor)"
                size="sm"
              />
              <Button
                onClick={handleAddCategory}
                size="sm"
                disabled={addingCategory || !newCategoryLabel.trim()}
              >
                {addingCategory ? "Adding..." : "Add"}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-xs border border-gray-300">
                <thead>
                  <tr className="bg-gray-200 font-semibold">
                    <th className="p-2 text-left">Label</th>
                    <th className="p-2 text-left">Value</th>
                    <th className="p-2 text-left w-32">Products</th>
                    <th className="p-2 text-left w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingCategories ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center">Loading...</td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-500">
                        No categories yet. Add one above.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat._id} className="bg-gray-50 border-t">
                        <td className="p-2">{cat.label}</td>
                        <td className="p-2 text-gray-500">{cat.value}</td>
                        <td className="p-2">
                          {cat.status === "generating" ? (
                            <span className="px-3 py-1 bg-gray-200 text-gray-500 text-xs font-semibold rounded cursor-not-allowed">
                              Generating...
                            </span>
                          ) : (
                            <button onClick={() => openCategoryModal(cat)} className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-semibold rounded transition-colors inline-block">
                              View Products
                            </button>
                          )}
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => handleDeleteCategory(cat._id)}
                            className="text-red-500 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ================= MODALS ================= */}
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
        <CategoryProductsModal
          category={selectedCategory}
          isOpen={isCategoryModalOpen}
          onClose={closeCategoryModal}
        />
      </main>
    </div>
  );
}
