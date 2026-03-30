"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/Button/ButtonComponent";
import Input from "@/src/components/ui/TextInput/InputComponent";
import Textarea from "@/src/components/ui/Textarea/TextareaComponent";
import Modal from "@/src/components/ui/Modal/Modal";
import EmptyState from "@/src/components/ui/EmptyState/EmptyState";
import Spinner from "@/src/components/ui/Spinner/Spinner";
import ProductCardComponent from "@/src/components/layout/ProductCard/ProductCardComponent";

export default function ProductsPage() {
  const router = useRouter();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingStore, setLoadingStore] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [manualName, setManualName] = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualImage, setManualImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generatingProducts, setGeneratingProducts] = useState(false);

  useEffect(() => {
    fetch("/api/store/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?._id) {
          setStore(data);
          fetchProducts(data._id);
        } else {
          router.push("/merchant/dashboard");
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingStore(false));
  }, [router]);

  const fetchProducts = async (storeId: string) => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`/api/product?store_id=${storeId}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingProducts(false);
  };

  const toggleSelection = async (productId: string, currentStatus: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, selected: !currentStatus } : p))
    );
    try {
      const res = await fetch(`/api/product/${productId}/select`, { method: "PATCH" });
      if (!res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? { ...p, selected: currentStatus } : p))
        );
      }
    } catch (err) {
      console.error(err);
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, selected: currentStatus } : p))
      );
    }
  };

  const handleManualAdd = async () => {
    if (!manualName || !manualPrice) return alert("Name and price are required");
    setSubmitting(true);
    try {
      const res = await fetch("/api/product/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: store._id,
          name: manualName,
          description: manualDesc,
          price: parseFloat(manualPrice),
          image_url: manualImage,
        }),
      });
      if (res.ok) {
        const newProduct = await res.json();
        setProducts([...products, newProduct]);
        setIsModalOpen(false);
        setManualName("");
        setManualDesc("");
        setManualPrice("");
        setManualImage("");
      } else {
        alert("Failed to add product");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding product");
    }
    setSubmitting(false);
  };

  const handleGenerateProducts = async () => {
    if (!store?._id) return;
    setGeneratingProducts(true);
    try {
      const res = await fetch(`/api/product/generate?store_id=${store._id}`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to generate products");
      } else {
        await fetchProducts(store._id);
        setStore((prev: any) => ({ ...prev, status: "draft" }));
      }
    } catch (err) {
      console.error(err);
      alert("Request failed");
    }
    setGeneratingProducts(false);
  };

  if (loadingStore) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {store?.name} Products
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {products.length} product{products.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Add Product
        </Button>
      </div>

      {/* Products Grid */}
      <main>
        {loadingProducts ? (
          <div className="py-20">
            <Spinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] shadow-[var(--shadow-sm)]">
            <EmptyState
              title="No products yet"
              description="Generate AI-powered products or add them manually to start building your storefront."
              actionLabel={generatingProducts ? "Generating..." : "Generate Products"}
              onAction={handleGenerateProducts}
              loading={generatingProducts}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCardComponent
                key={product._id}
                product={product}
                toggleSelection={toggleSelection}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Custom Product"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            name="productName"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            placeholder="e.g. Premium Cotton T-Shirt"
            label="Product Name"
          />
          <Textarea
            name="productDesc"
            value={manualDesc}
            onChange={(e) => setManualDesc(e.target.value)}
            placeholder="Describe your product..."
            label="Description (optional)"
            rows={3}
          />
          <Input
            name="productPrice"
            value={manualPrice}
            onChange={(e) => setManualPrice(e.target.value)}
            placeholder="29.99"
            type="number"
            label="Price ($)"
          />
          <Input
            name="productImage"
            value={manualImage}
            onChange={(e) => setManualImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            label="Image URL (optional)"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleManualAdd} loading={submitting}>
              Add Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
