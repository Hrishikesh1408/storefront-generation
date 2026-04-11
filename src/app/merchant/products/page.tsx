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


  useEffect(() => {
    fetch("/api/store/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?._id) {
          setStore(data);
          fetchProducts(data.category, data);
        } else {
          router.push("/merchant/dashboard");
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingStore(false));
  }, [router]);

  const fetchProducts = async (category: string, currentStore: any) => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`/api/product/by-category/${category}`);
      if (res.ok) {
        const allCategoryProducts = await res.json();
        // Map selected state from store.products (field is products: { [id]: true | {price: N} })
        const mapped = allCategoryProducts.map((p: any) => {
          const override = currentStore.products && currentStore.products[p._id];
          const isObject = override && typeof override === "object";
          const hasOverridePrice = isObject && override.price !== undefined;
          const hasOverrideStock = isObject && override.stock !== undefined;
          
          return {
            ...p,
            price: hasOverridePrice ? override.price : p.price,
            stock: hasOverrideStock ? override.stock : 0,
            selected: !!override
          };
        });
        setProducts(mapped);
      }
    } catch (err) {
      console.error("Error fetching category products:", err);
    }
    setLoadingProducts(false);
  };

  const toggleSelection = async (productId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, selected: nextStatus } : p))
    );

    try {
      const url = nextStatus 
        ? "/api/store/select-products" 
        : `/api/store/deselect-product/${productId}`;
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: nextStatus ? JSON.stringify({ product_ids: [productId] }) : undefined,
      });

      if (!res.ok) {
        throw new Error("Failed to update selection");
      }

      // Update store state locally for consistency
      setStore((prev: any) => {
        const newProductsMap = { ...(prev.products || {}) };
        if (nextStatus) newProductsMap[productId] = true;
        else delete newProductsMap[productId];
        return { ...prev, products: newProductsMap };
      });

    } catch (err) {
      console.error(err);
      // Revert on failure
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, selected: currentStatus } : p))
      );
    }
  };

  const updateProductPrice = async (productId: string, newPrice: number) => {
    try {
      const res = await fetch("/api/store/product/price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, price: newPrice }),
      });

      if (!res.ok) {
        throw new Error("Failed to update product price");
      }

      // Update local products state
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, price: newPrice } : p))
      );

      // Update store state for consistency
      setStore((prev: any) => {
        const newProductsMap = { ...(prev.products || {}) };
        if (newProductsMap[productId]) {
          const current = typeof newProductsMap[productId] === "object" ? newProductsMap[productId] : {};
          newProductsMap[productId] = { ...current, price: newPrice };
        }
        return { ...prev, products: newProductsMap };
      });
      
    } catch (err) {
      console.error("Error updating price:", err);
      throw err;
    }
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      const res = await fetch("/api/store/product/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, stock: newStock }),
      });

      if (!res.ok) {
        throw new Error("Failed to update product stock");
      }

      // Update local products state
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, stock: newStock } : p))
      );

      // Update store state for consistency
      setStore((prev: any) => {
        const newProductsMap = { ...(prev.products || {}) };
        if (newProductsMap[productId]) {
          const current = typeof newProductsMap[productId] === "object" ? newProductsMap[productId] : {};
          newProductsMap[productId] = { ...current, stock: newStock };
        }
        return { ...prev, products: newProductsMap };
      });
      
    } catch (err) {
      console.error("Error updating stock:", err);
      throw err;
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
        
        // Manual add in backend also updates store.products, so we need to update our store state
        setStore((prev: any) => ({
            ...prev,
            products: { ...(prev.products || {}), [newProduct._id]: true }
        }));

        // Refresh product list to include the new product
        fetchProducts(store.category, {
            ...store,
            products: { ...(store.products || {}), [newProduct._id]: true }
        });

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
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow mt-10 border border-dashed border-gray-300">
            <p className="text-gray-500 mb-6 text-lg">No products yet. Click &quot;Add Custom Product&quot; to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCardComponent
                key={product._id}
                product={product}
                toggleSelection={toggleSelection}
                updatePrice={updateProductPrice}
                updateStock={updateProductStock}
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
