"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/src/assets/images/newturbifylogo.png";
import Button from "@/src/components/ui/Button/ButtonComponent";

export default function Page() {
  const [store, setStore] = useState<any>(null);
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStore, setLoadingStore] = useState(true);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const StoreCategories = [
  {label:"Clothing", value: "clothing"},
  {label:"Electronics", value: "electronics"},
  {label:"Home Decor", value: "home_decor"},
  {label:"Beauty", value: "beauty"},
  {label:"Fitness", value: "fitness"},
  {label:"Food & Beverage", value: "food_beverage"},
  {label:"Accessories", value: "accessories"},
  ];

  useEffect(() => {
    fetch("/api/store/me")
      .then(res => res.json())
      .then(data => {
        if (data?._id) {
          setStore(data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingStore(false));
  }, []);

  // 🔹 Create store
  const handleCreate = async () => {
    if (!storeName) return alert("Enter store name");
    if (!category) return alert("Select category");

    setLoading(true);

    try {
      const res = await fetch("/api/store/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: storeName,
            category: category,
            description: description,
            logo: logoUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Something went wrong");
      } else {
        setStore(data);
      }
    } catch (err) {
      console.error(err);
      alert("Request failed");
    }

    setLoading(false);
  };

  // ✅ prevent flicker
  if (loadingStore) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="h-20 flex items-center px-20 bg-white shadow">
        <Image src={logo} alt="Logo" className="w-32 h-auto" priority />
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-20 py-1">
        {!store ? (
          <div className="bg-white p-8 rounded-2xl w-[420px] shadow-lg">
            <h2 className="text-lg mb-4">Create Your Store</h2>

            <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Store name"
                className="w-full border px-3 py-2 mb-3"
            />

            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)} 
                className="w-full border px-3 py-2 mb-3"
            >
                <option value="">Select category</option> 
                {StoreCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                        {cat.label}
                    </option>
                ))}
            </select>

            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Store description"
                className="w-full border px-3 py-2 mb-3"
            />

            <input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="Logo URL (optional)"
                className="w-full border px-3 py-2 mb-4"
            />

            <Button
              onClick={handleCreate}
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Store"}
            </Button>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl w-[420px] shadow-lg">
            <h1 className="text-2xl font-semibold mb-4">
              {store.name}
            </h1>

            <p className="text-gray-600">
              Category: {store.category}
            </p>

            <p className="text-gray-600">
              Description: {store.description}
            </p>

            <p className="text-gray-600">
              Store Status: {store.status}
            </p>

            <Button
              onClick={() => alert("Product generation coming soon!")}
              className="w-full mt-6"
              disabled={loading}
            >
              {"Generate Product"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}