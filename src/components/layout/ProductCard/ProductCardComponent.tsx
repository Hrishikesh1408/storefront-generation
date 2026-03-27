"use client"

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
    toggleSelection
}: ProductCardComponentProps) {
    return (
        <div className="bg-white p-4 rounded-xl shadow flex flex-col">
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
    );
}