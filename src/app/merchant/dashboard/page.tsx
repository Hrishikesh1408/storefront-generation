"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/Button/ButtonComponent";
import Input from "@/src/components/ui/TextInput/InputComponent";
import Select from "@/src/components/ui/Select/SelectComponent";
import Textarea from "@/src/components/ui/Textarea/TextareaComponent";
import Card from "@/src/components/ui/Card/Card";
import Badge from "@/src/components/ui/Badge/Badge";
import Spinner from "@/src/components/ui/Spinner/Spinner";

export default function MerchantDashboard() {
  const router = useRouter();
  const [store, setStore] = useState<any>(null);
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);

  const [publishing, setPublishing] = useState(false);
  const [loadingStore, setLoadingStore] = useState(true);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [storeCategories, setStoreCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/category")
      .then((res) => res.json())
      .then((data) => setStoreCategories(data.categories || []))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    fetch("/api/store/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?._id) setStore(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingStore(false));
  }, []);

  const getCategoryLabel = (value: string) => {
    return storeCategories.find((cat) => cat.value === value)?.label || value;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "success" | "warning" | "danger" | "neutral"; label: string }> = {
      active: { variant: "success", label: "Active" },
      pending: { variant: "warning", label: "Pending" },
      deferred: { variant: "danger", label: "Deferred" },
    };
    const match = config[status] || { variant: "neutral" as const, label: status };
    return <Badge variant={match.variant as "success" | "warning" | "info" | "neutral" | "danger"}>{match.label}</Badge>;
  };

  const handleCreate = async () => {
    if (!storeName) return alert("Enter store name");
    if (!category) return alert("Select category");

    setLoading(true);
    try {
      const res = await fetch("/api/store/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: storeName,
          category,
          description,
          logo: logoUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Something went wrong");
      else setStore(data);
    } catch (err) {
      console.error(err);
      alert("Request failed");
    }
    setLoading(false);
  };


  const handlePublishStore = async () => {
    setPublishing(true);
    try {
      const res = await fetch("/api/store/publish", { method: "POST" });
      if (!res.ok) alert("Failed to publish store");
      else setStore((prev: any) => ({ ...prev, status: "active" }));
    } catch (err) {
      console.error(err);
      alert("Error publishing store");
    }
    setPublishing(false);
  };

  if (loadingStore) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 flex items-center justify-center min-h-full">
      <main className="w-full max-w-md animate-slide-up">
        {!store ? (
          /* Create Store Form */
          <Card padding="lg">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-[var(--primary-50)] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--primary-600)]">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Create Your Store
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Set up your storefront in a few simple steps
              </p>
            </div>

            <div className="space-y-4">
              <Input
                name="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. The Style Corner"
                label="Store Name"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border px-3 py-2 mb-3"
              >
                <option value="">Select category</option>
                {storeCategories.map((cat: any) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              <Textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your store..."
                label="Description"
                rows={3}
              />

              <Input
                name="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                label="Logo URL (optional)"
              />

              <Button
                onClick={handleCreate}
                fullWidth
                loading={loading}
                className="mt-2"
              >
                Create Store
              </Button>
            </div>
          </Card>
        ) : (
          /* Store Info Card */
          <Card padding="lg">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                {store.name}
              </h1>
              {getStatusBadge(store.status || "deferred")}
            </div>

            <p className="text-gray-600">
              Category: {getCategoryLabel(store.category)}
            </p>

            <p className="text-gray-600">Description: {store.description}</p>

            <p className="text-gray-600 capitalize">Store Status: {store.status || "draft"}</p>

            {store.status === "active" ? (
              <Button
                className="w-full mt-6 opacity-70 cursor-not-allowed"
                disabled={true}
                onClick={() => { }}
              >
                Store is Active
              </Button>
            ) : (
              <Button
                onClick={handlePublishStore}
                className="w-full mt-6"
                disabled={publishing}
              >
                {publishing ? "Publishing..." : "Publish Store"}
              </Button>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}
