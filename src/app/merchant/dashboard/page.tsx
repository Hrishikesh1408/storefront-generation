"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/Button/ButtonComponent";

export default function Page() {
  const router = useRouter();
  const [store, setStore] = useState<any>(null);
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingProducts, setGeneratingProducts] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadingStore, setLoadingStore] = useState(true);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const StoreCategories = [
    { label: "Clothing", value: "clothing" },
    { label: "Home Decor", value: "home_decor" },
    { label: "Beauty", value: "beauty" },
    { label: "Food & Beverage", value: "food_beverage" },
    { label: "Bakery", value: "bakery" },
  ];

  useEffect(() => {
    fetch("/api/store/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?._id) {
          setStore(data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingStore(false));
  }, []);

  const getCategoryLabel = (value: string) => {
    return StoreCategories.find((cat) => cat.value === value)?.label || value;
  };

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

  // 🔹 Generate products
  const handleGenerateProducts = async () => {
    if (!store?._id) return;
    setGeneratingProducts(true);

    try {
      const res = await fetch(`/api/product/generate?store_id=${store._id}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to generate products");
        setGeneratingProducts(false);
      } else {
        router.push("/merchant/products");
      }
    } catch (err) {
      console.error(err);
      alert("Request failed");
      setGeneratingProducts(false);
    }
  };

  // 🔹 Publish Store
  const handlePublishStore = async () => {
    setPublishing(true);
    try {
      const res = await fetch("/api/store/publish", { method: "POST" });
      if (!res.ok) {
        alert("Failed to publish store");
      } else {
        setStore((prev: any) => ({ ...prev, status: "active" }));
      }
    } catch (err) {
      console.error(err);
      alert("Error publishing store");
    }
    setPublishing(false);
  };

  // ✅ prevent flicker
  if (loadingStore) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="p-10 flex items-center justify-center min-h-full">
      <main className="w-full flex justify-center">
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
            <h1 className="text-2xl font-semibold mb-4">{store.name}</h1>

            <p className="text-gray-600">
              Category: {getCategoryLabel(store.category)}
            </p>

            <p className="text-gray-600">Description: {store.description}</p>

            <p className="text-gray-600 capitalize">Store Status: {store.status || "deferred"}</p>

            {store.status === "active" ? (
                <Button
                  className="w-full mt-6 opacity-70 cursor-not-allowed"
                  disabled={true}
                  onClick={() => {}}
                >
                  Store is Active
                </Button>
            ) : store.status === "draft" ? (
                <Button
                  onClick={handlePublishStore}
                  className="w-full mt-6"
                  disabled={publishing}
                >
                  {publishing ? "Publishing..." : "Publish Store"}
                </Button>
            ) : store.status === "pending" ? (
                <Button
                  className="w-full mt-6 opacity-70 cursor-not-allowed"
                  disabled={true}
                  onClick={() => {}}
                >
                  Generating Products...
                </Button>
            ) : (
                <Button
                  onClick={handleGenerateProducts}
                  className="w-full mt-6"
                  disabled={generatingProducts}
                >
                  {generatingProducts ? "Generating Products..." : "Generate Products"}
                </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
