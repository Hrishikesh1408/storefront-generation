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
        if (data?._id) setStore(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingStore(false));
  }, []);

  const getCategoryLabel = (value: string) =>
    StoreCategories.find((cat) => cat.value === value)?.label || value;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge variant="success" dot>Active</Badge>;
      case "draft": return <Badge variant="info" dot>Draft</Badge>;
      case "pending": return <Badge variant="warning" dot>Pending</Badge>;
      default: return <Badge variant="neutral" dot>Deferred</Badge>;
    }
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

              <Select
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={StoreCategories}
                placeholder="Choose a category"
                label="Category"
              />

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

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-default)]">
                <span className="text-sm text-[var(--text-muted)]">Category</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {getCategoryLabel(store.category)}
                </span>
              </div>
              {store.description && (
                <div className="flex justify-between items-start py-2 border-b border-[var(--border-default)]">
                  <span className="text-sm text-[var(--text-muted)] shrink-0 mr-4">Description</span>
                  <span className="text-sm text-[var(--text-primary)] text-right">
                    {store.description}
                  </span>
                </div>
              )}
            </div>

            {store.status === "active" ? (
              <Button fullWidth disabled variant="secondary">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 8l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Store is Active
              </Button>
            ) : store.status === "draft" ? (
              <Button
                onClick={handlePublishStore}
                fullWidth
                loading={publishing}
              >
                Publish Store
              </Button>
            ) : store.status === "pending" ? (
              <Button fullWidth disabled variant="secondary" loading>
                Generating Products...
              </Button>
            ) : (
              <Button
                onClick={handleGenerateProducts}
                fullWidth
                loading={generatingProducts}
              >
                Generate Products
              </Button>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}
