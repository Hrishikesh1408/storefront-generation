"use client";

import Image from "next/image";

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
}

export default function ProductCardComponent({
  product,
  toggleSelection,
}: ProductCardComponentProps) {
  return (
    <div className="bg-white rounded-[var(--radius-md)] border border-[var(--border-default)] shadow-[var(--shadow-sm)] overflow-hidden card-hover group">
      {/* Image */}
      {product.image_url && (
        <div className="relative overflow-hidden">
          <Image
            src={product.image_url}
            alt={product.name}
            width={400}
            height={300}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Price badge overlay */}
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-[var(--radius-full)] bg-white/90 backdrop-blur-sm text-sm font-semibold text-[var(--text-primary)] shadow-sm">
              ${product.price}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-[var(--text-primary)] mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-[var(--text-muted)] mb-4 flex-1 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* No image price fallback */}
        {!product.image_url && (
          <div className="text-lg font-bold text-[var(--text-primary)] mb-3">
            ${product.price}
          </div>
        )}

        {/* Toggle Switch */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)]">
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