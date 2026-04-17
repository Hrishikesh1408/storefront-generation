"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useParams } from "next/navigation";

export interface CartItem {
    product_id: string;
    quantity: number;
    name: string;
    price: number;
    image_url?: string;
    stock: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem, quantity: number) => void;
    updateQuantity: (product_id: string, quantity: number) => void;
    removeFromCart: (product_id: string) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const params = useParams();
    const store_id = params?.id as string;

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage and backend
    useEffect(() => {
        if (!store_id) return;

        const loadCart = async () => {
            // 1. Load from local storage
            const localKey = `cart_${store_id}`;
            const localCartStr = localStorage.getItem(localKey);
            let mergedCart: CartItem[] = [];

            if (localCartStr) {
                try {
                    mergedCart = JSON.parse(localCartStr);
                } catch (e) {
                    console.error("Failed to parse local cart:", e);
                }
            }

            // 2. Sync from backend if user is authenticated (token exists)
            // Need to check if user is logged in. Assuming /api/cart/{store_id} handles 401
            try {
                const res = await fetch(`/api/cart/${store_id}`);

                if (res.ok) {
                    const serverCart = await res.json();
                    if (serverCart && serverCart.items) {
                        // Merge logic: server takes precedence if it has more recent items?
                        // For simplicity, if server cart has items, we use them, unless local cart has items not on server.
                        // Real logic: we should maybe just overwrite with server or merge quantities. Let's merge server to local.
                        const serverItems = serverCart.items as CartItem[];
                        // Simple merge: let server items update local items if they match, add if missing.
                        // Actually, if we just want it to "remain even if user comes back", merging is good.
                        const mergedMap = new Map(mergedCart.map(i => [i.product_id, i]));
                        for (const s_item of serverItems) {
                            mergedMap.set(s_item.product_id, { ...mergedMap.get(s_item.product_id), ...s_item });
                        }
                        mergedCart = Array.from(mergedMap.values());
                    }
                }
            } catch (e) {
                console.error("Backend cart fetch failed:", e);
            }

            setCartItems(mergedCart);
            setIsLoaded(true);
        };
        loadCart();
    }, [store_id]);

    // Save to localStorage and server on change
    useEffect(() => {
        if (!isLoaded || !store_id) return;

        const localKey = `cart_${store_id}`;
        localStorage.setItem(localKey, JSON.stringify(cartItems));

        const syncWithServer = async () => {
            try {
                await fetch(`/api/cart/${store_id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ items: cartItems.map(i => ({ product_id: i.product_id, quantity: i.quantity, name: i.name, price: i.price })) })
                });
            } catch (e) {
                console.error("Failed to sync cart to server");
            }
        };

        const timeout = setTimeout(() => syncWithServer(), 1000); // debounce sync
        return () => clearTimeout(timeout);

    }, [cartItems, isLoaded, store_id]);


    const addToCart = (item: CartItem, quantity: number) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.product_id === item.product_id);
            if (existing) {
                const newQty = Math.min(existing.quantity + quantity, existing.stock);
                return prev.map(i => i.product_id === item.product_id ? { ...i, quantity: newQty } : i);
            }
            return [...prev, { ...item, quantity }];
        });
    };

    const updateQuantity = (product_id: string, quantity: number) => {
        setCartItems(prev => {
            if (quantity <= 0) return prev.filter(i => i.product_id !== product_id);
            return prev.map(i => i.product_id === product_id ? { ...i, quantity } : i);
        });
    };

    const removeFromCart = (product_id: string) => {
        setCartItems(prev => prev.filter(i => i.product_id !== product_id));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
