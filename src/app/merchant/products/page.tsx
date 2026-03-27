"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/Button/ButtonComponent";

export default function ProductsPage() {
  const router = useRouter();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingStore, setLoadingStore] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Manual Product State
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
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) =>
        p._id === productId ? { ...p, selected: !currentStatus } : p
      )
    );

    try {
      const res = await fetch(`/api/product/${productId}/select`, { method: "PATCH" });
      if (!res.ok) {
        // Revert on failure
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId ? { ...p, selected: currentStatus } : p
          )
        );
      }
    } catch (err) {
      console.error(err);
      // Revert on failure
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, selected: currentStatus } : p
        )
      );
    }
  };

  const handleManualAdd = async () => {
    if (!manualName || !manualPrice) return alert("Name and price are required");

    setSubmitting(true);
    try {
      const payload = {
        store_id: store._id,
        name: manualName,
        description: manualDesc,
        price: parseFloat(manualPrice),
        image_url: manualImage
      };

      const res = await fetch("/api/product/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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
        setStore((prev: any) => ({ ...prev, status: "active" }));
      }
    } catch (err) {
      console.error(err);
      alert("Request failed");
    }

    setGeneratingProducts(false);
  };

  if (loadingStore) {
    return <div className="p-10 text-center mt-20">Loading...</div>;
  }

  return (
    <div className="p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">{store?.name} Products</h1>
        <Button onClick={() => setIsModalOpen(true)}>Add Custom Product</Button>
      </div>

      <main>
        {loadingProducts ? (
          <div className="text-center">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow mt-10 border border-dashed border-gray-300">
            <p className="text-gray-500 mb-6 text-lg">No products found. Start building your storefront by generating products.</p>
            <Button
              onClick={handleGenerateProducts}
              disabled={generatingProducts}
              className="px-8 py-3"
            >
              {generatingProducts ? "Generating Products..." : "Generate Products"}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white p-4 rounded-xl shadow flex flex-col">
                {product.image_url && (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-lg font-medium">{product.name}</h3>
                <p className="text-gray-600 text-sm mt-1 mb-3 flex-1">{product.description}</p>
                <div className="font-semibold text-lg mb-3">${product.price}</div>
                <div className="flex items-center justify-between mt-auto border-t pt-3">
                  <span className="text-sm font-medium text-gray-700">Display on Storefront</span>
                  <input
                    type="checkbox"
                    checked={product.selected || false}
                    onChange={() => toggleSelection(product._id, product.selected || false)}
                    className="w-5 h-5 text-blue-600 rounded bg-gray-100 border-gray-300 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[90%] max-w-[400px]">
            <h2 className="text-xl font-bold mb-6">Add Custom Product</h2>

            <input
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="Product Name"
              className="w-full border px-3 py-2 mb-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <textarea
              value={manualDesc}
              onChange={(e) => setManualDesc(e.target.value)}
              placeholder="Description (Optional)"
              className="w-full border px-3 py-2 mb-4 rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="number"
              value={manualPrice}
              onChange={(e) => setManualPrice(e.target.value)}
              placeholder="Price"
              className="w-full border px-3 py-2 mb-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              value={manualImage}
              onChange={(e) => setManualImage(e.target.value)}
              placeholder="Image URL (optional)"
              className="w-full border px-3 py-2 mb-6 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <Button onClick={handleManualAdd} disabled={submitting}>
                {submitting ? "Adding..." : "Add Product"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
