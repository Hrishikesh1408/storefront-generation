"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductCardComponentProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    selected?: boolean;
  };
  toggleSelection: (productId: string, currentStatus: boolean) => void;
  updatePrice?: (productId: string, newPrice: number) => Promise<void>;
}

export default function ProductCardComponent({
  product,
  toggleSelection,
  updatePrice,
}: ProductCardComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newPrice, setNewPrice] = useState(product.price.toString());
  const [loading, setLoading] = useState(false);

  const handlePriceUpdate = async () => {
    if (!updatePrice) return;
    const priceValue = parseFloat(newPrice);
    if (isNaN(priceValue)) return alert("Please enter a valid price");

    setLoading(true);
    try {
      await updatePrice(product._id, priceValue);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[var(--radius-md)] border border-[var(--border-default)] shadow-[var(--shadow-sm)] overflow-hidden card-hover group flex flex-col h-full">
      {/* Image */}
      {product.image_url && (
        <div className="relative overflow-hidden shrink-0">
          <Image
            src={product.image_url}
            alt={product.name}
            width={400}
            height={300}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Price badge overlay */}
          {!isEditing && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-[var(--radius-full)] bg-white/90 backdrop-blur-sm text-sm font-semibold text-[var(--text-primary)] shadow-sm">
                ₹{product.price}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className="font-semibold text-[var(--text-primary)] line-clamp-1">
            {product.name}
          </h3>

        </div>

        <p className="text-sm text-[var(--text-muted)] mb-4 flex-1 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {product.selected && updatePrice && !isEditing && (
          <button
            onClick={() => {
              setIsEditing(true);
              setNewPrice(product.price.toString());
            }}
            className="text-[var(--primary-600)] hover:text-[var(--primary-700)] text-[10px] font-bold uppercase tracking-wider shrink-0"
          >
            Edit Price
          </button>
        )}

        {/* Price Editor Overlay or Fallback */}
        {isEditing ? (
          <div className="mb-4 p-3 bg-[var(--neutral-50)] rounded-[var(--radius-sm)] border border-[var(--border-default)] animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="block text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] mb-1">
              Store Specific Price
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="number"
                step="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-[var(--border-default)] rounded-[var(--radius-xs)] focus:ring-1 focus:ring-[var(--primary-400)] outline-none bg-white"
                placeholder="29.99"
                autoFocus
              />
              <button
                onClick={handlePriceUpdate}
                disabled={loading}
                className="px-3 py-1 bg-[var(--primary-600)] text-white text-xs font-semibold rounded-[var(--radius-xs)] hover:bg-[var(--primary-700)] disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? "..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewPrice(product.price.toString());
                }}
                className="px-3 py-1 border border-[var(--border-default)] text-[var(--text-primary)] text-xs font-semibold rounded-[var(--radius-xs)] hover:bg-white"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          !product.image_url && (
            <div className="text-lg font-bold text-[var(--text-primary)] mb-3">
              ${product.price}
            </div>
          )
        )}

        {/* Toggle Switch */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)] mt-auto">
          <span className="text-xs font-medium text-[var(--text-muted)]">
            Display on Storefront
          </span>
          <button
            onClick={() => toggleSelection(product._id, product.selected || false)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full
              transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--primary-200)]
              ${product.selected ? "bg-[var(--primary-600)]" : "bg-[var(--neutral-200)]"}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 rounded-full bg-white shadow-sm transform
                transition-transform duration-200
                ${product.selected ? "translate-x-5.5" : "translate-x-1"}
              `}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
