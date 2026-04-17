"use client";

import { useState, useEffect } from "react";
import Modal from "@/src/components/ui/Modal/Modal";
import Image from "next/image";

type Props = {
  category: any | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function CategoryProductsModal({ category, isOpen, onClose }: Props) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && category) {
      fetchProducts(category.value);
    } else {
      setProducts([]);
      setError("");
    }
  }, [isOpen, category]);

  const fetchProducts = async (value: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/product/by-category/${value}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch products");
      setProducts(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? `Products in "${category.label}"` : "Category Products"}
    >
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading products...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg">
            No products generated for this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product) => (
              <div key={product._id} className="border border-gray-200 rounded-lg flex flex-col bg-white overflow-hidden shadow-sm">
                <div className="h-32 w-full relative bg-gray-50 border-b border-gray-100 p-2 flex items-center justify-center">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-contain p-2"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">No Image</span>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-tight flex-1">
                    {product.description}
                  </p>
                  <p className="mt-2 font-bold text-gray-900 border-t border-gray-50 pt-2 text-sm">
                    ₹{product.price?.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={onClose}
          className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-medium shadow-sm hover:bg-gray-300 transition-colors text-sm"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
