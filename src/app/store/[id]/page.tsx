"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Spinner from "@/src/components/ui/Spinner/Spinner";
import ProfileDropdown from "@/src/components/auth/ProfileDropdown";
import Button from "@/src/components/ui/Button/ButtonComponent";
import Card from "@/src/components/ui/Card/Card";
import { useCart } from "@/src/context/CartContext";

export default function StorefrontPage() {
    const { id } = useParams();
    const router = useRouter();
    const { addToCart, cartCount, cartItems, updateQuantity, removeFromCart } = useCart();

    const [store, setStore] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        const fetchStorefrontValues = async () => {
            setLoading(true);
            try {
                // Fetch Store Info
                const storeRes = await fetch(`/api/store/${id}`);
                if (!storeRes.ok) {
                    throw new Error("Store not found");
                }
                const storeData = await storeRes.json();
                setStore(storeData);

                // Fetch Products
                const productsRes = await fetch(`/api/product?store_id=${id}`);
                if (productsRes.ok) {
                    const productsData = await productsRes.json();
                    // Filter out error cases just in case
                    if (Array.isArray(productsData)) {
                        setProducts(productsData);
                    }
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Failed to load store");
            }
            setLoading(false);
        };

        fetchStorefrontValues();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-body)]">
                <Spinner size="lg" />
                <p className="mt-4 text-[var(--text-secondary)] animate-pulse">Loading storefront...</p>
            </div>
        );
    }

    if (error || !store) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-body)] px-4 text-center">
                <Card padding="lg" className="max-w-md w-full border border-[var(--danger-light)]">
                    <div className="w-16 h-16 bg-[var(--danger-light)] text-[var(--danger)] rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Oops!</h1>
                    <p className="text-[var(--text-secondary)]">{error || "This store does not exist or is unavailable."}</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-body)] font-sans">
            {/* Dynamic Header/Hero Section */}
            <header className="h-20 flex items-center justify-between px-4 md:px-8 border-b border-[var(--border-default)] bg-white/80 backdrop-blur-md sticky top-0 z-30">

                {/* Left: Store Info */}
                <div className="flex items-center gap-3">
                    {store.logo ? (
                        <Image
                            src={store.logo}
                            alt={`${store.name} logo`}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-md object-cover border border-[var(--border-default)]"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-md bg-[var(--primary-50)] flex items-center justify-center border border-[var(--border-default)]">
                            <span className="text-sm font-semibold text-[var(--primary-500)]">
                                {store.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}

                    <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                            {store.name}
                        </span>
                        <span className="text-xs text-[var(--text-secondary)] truncate max-w-[200px]">
                            {store.description || "Freshly baked goods delivered with care."}
                        </span>
                    </div>
                </div>

                {/* Right: Optional Actions */}
                <div className="flex items-center gap-4">
                    {cartCount > 0 && (
                        <button
                            onClick={() => router.push(`/store/${id}/checkout`)}
                            className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--primary-600)] transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-[var(--primary-600)] rounded-full">
                                {cartCount}
                            </span>
                        </button>
                    )}
                    <ProfileDropdown />
                </div>

            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">Featured Products</h2>
                    <span className="text-sm font-medium text-[var(--text-secondary)] bg-[var(--neutral-100)] px-3 py-1 rounded-[var(--radius-full)] tracking-wide">
                        {products.length} Items
                    </span>
                </div>

                {products.length === 0 ? (
                    <Card padding="lg" className="text-center shadow-[var(--shadow-sm)] border border-[var(--border-default)]">
                        <div className="w-24 h-24 bg-[var(--primary-50)] rounded-[var(--radius-full)] flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-[var(--primary-300)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No Products Yet</h3>
                        <p className="text-[var(--text-secondary)] max-w-sm mx-auto">This store hasn't added any products to their collection. Check back soon!</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Card
                                key={product._id}
                                padding="none"
                                hover
                                className="group flex flex-col overflow-hidden animate-slide-up"
                            >
                                {/* Product Image Sub-Container */}
                                {product.image_url ? (
                                    <div className="relative overflow-hidden bg-[var(--neutral-50)]">
                                        <Image
                                            src={product.image_url}
                                            alt={product.name}
                                            width={400}
                                            height={300}
                                            className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        {/* Price and Stock badge overlay */}
                                        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-[var(--radius-full)] bg-white/90 backdrop-blur-sm text-sm font-semibold text-[var(--text-primary)] shadow-sm">
                                                ₹{product.price}
                                            </span>
                                            {product.stock !== undefined && (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-full)] backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider shadow-sm 
                                                    ${product.stock > 0 ? 'bg-white/90 text-green-700' : 'bg-white/90 text-red-700'}`}>
                                                    {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative overflow-hidden w-full h-56 flex justify-center items-center bg-[var(--neutral-100)] group-hover:bg-[var(--neutral-200)] transition-colors">
                                        <svg className="w-16 h-16 text-[var(--neutral-300)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-[var(--radius-full)] bg-white/90 backdrop-blur-sm text-sm font-semibold text-[var(--text-primary)] shadow-sm">
                                                ₹{product.price}
                                            </span>
                                            {product.stock !== undefined && (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-full)] backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider shadow-sm 
                                                    ${product.stock > 0 ? 'bg-green-100/90 text-green-700' : 'bg-red-100/90 text-red-700'}`}>
                                                    {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Product Details */}
                                <div className="p-4 flex flex-col flex-1">
                                    <h3 className="font-semibold text-[var(--text-primary)] mb-1 line-clamp-1 group-hover:text-[var(--primary-600)] transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-[var(--text-muted)] mb-4 flex-1 line-clamp-2 leading-relaxed">
                                        {product.description || "No description provided."}
                                    </p>

                                    {/* Action Area */}
                                    <div className="pt-3 border-t border-[var(--border-default)]">
                                        {(() => {
                                            const cartItem = cartItems.find(item => item.product_id === product._id);
                                            if (cartItem) {
                                                return (
                                                    <div className="flex items-center justify-between border border-[var(--primary-200)] rounded-[var(--radius-sm)] bg-[var(--primary-50)] overflow-hidden h-10 w-full">
                                                        <button
                                                            onClick={() => {
                                                                if (cartItem.quantity === 1) {
                                                                    removeFromCart(product._id);
                                                                } else {
                                                                    updateQuantity(product._id, cartItem.quantity - 1);
                                                                }
                                                            }}
                                                            className="flex-1 h-full flex items-center justify-center text-[var(--primary-700)] hover:bg-[var(--primary-100)] transition-colors active:bg-[var(--primary-200)]"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" /></svg>
                                                        </button>
                                                        <span className="px-4 text-sm font-bold text-[var(--primary-900)]">
                                                            {cartItem.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(product._id, cartItem.quantity + 1)}
                                                            disabled={cartItem.quantity >= product.stock}
                                                            className="flex-1 h-full flex items-center justify-center text-[var(--primary-700)] hover:bg-[var(--primary-100)] transition-colors active:bg-[var(--primary-200)] disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                                        </button>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <Button
                                                    variant={product.stock === 0 ? "ghost" : "secondary"}
                                                    fullWidth
                                                    disabled={product.stock === 0}
                                                    onClick={() => addToCart({
                                                        product_id: product._id,
                                                        quantity: 1,
                                                        name: product.name,
                                                        price: product.price,
                                                        image_url: product.image_url,
                                                        stock: product.stock
                                                    }, 1)}
                                                    className="glass transition-colors group-hover:bg-[var(--primary-50)] group-hover:border-[var(--primary-200)] group-hover:text-[var(--primary-700)] disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                                                </Button>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-[var(--border-default)] bg-[var(--bg-card)]">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        {store.logo ? (
                            <Image src={store.logo} alt="logo" width={32} height={32} className="w-8 h-8 rounded-[var(--radius-sm)] object-cover" />
                        ) : (
                            <div className="w-8 h-8 bg-[var(--primary-600)] rounded-[var(--radius-sm)] flex items-center justify-center">
                                <span className="text-white font-bold text-xs">{store.name?.charAt(0).toUpperCase()}</span>
                            </div>
                        )}
                        <span className="text-[var(--text-primary)] font-semibold">{store.name}</span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">
                        &copy; {new Date().getFullYear()} {store.name}. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
