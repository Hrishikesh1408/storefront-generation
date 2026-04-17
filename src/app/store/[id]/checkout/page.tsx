"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/src/context/CartContext";
import Button from "@/src/components/ui/Button/ButtonComponent";
import Card from "@/src/components/ui/Card/Card";

export default function CheckoutPage() {
    const { id } = useParams();
    const router = useRouter();
    const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handlePlaceOrder = async () => {
        setIsSubmitting(true);
        setError("");
        
        try {
            const res = await fetch('/api/order/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    store_id: id,
                    items: cartItems.map(item => ({
                        product_id: item.product_id,
                        quantity: item.quantity,
                        name: item.name,
                        price: item.price
                    }))
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Failed to place order");
            }

            // Success
            setSuccess(true);
            clearCart();
            setTimeout(() => {
                router.push(`/user/dashboard`);
            }, 3000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[var(--bg-body)] flex flex-col items-center justify-center p-4">
                <Card padding="lg" className="max-w-md w-full text-center animate-fade-in border border-green-200">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Order Placed!</h2>
                    <p className="text-[var(--text-secondary)] mb-6">Your order has been successfully placed. You will be redirected to your dashboard shortly.</p>
                    <Button onClick={() => router.push(`/user/dashboard`)} fullWidth>Go to Dashboard</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-body)] py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <button 
                    onClick={() => router.push(`/store/${id}`)}
                    className="flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary-600)] mb-8 transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Store
                </button>

                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Checkout</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg flex items-start gap-3">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {cartItems.length === 0 ? (
                    <Card padding="lg" className="text-center py-16">
                        <div className="w-20 h-20 bg-[var(--neutral-100)] rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-[var(--neutral-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Your cart is empty</h2>
                        <p className="text-[var(--text-secondary)] mb-6">Looks like you haven't added any items to your cart yet.</p>
                        <Button onClick={() => router.push(`/store/${id}`)}>Continue Shopping</Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 w-full">
                        {/* Cart Items List */}
                        <div className="md:col-span-7 lg:col-span-8 space-y-6 w-full">
                            {cartItems.map((item) => (
                                <Card key={item.product_id} padding="md" className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[var(--neutral-100)] rounded-md flex-shrink-0 relative overflow-hidden border border-[var(--border-default)]">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[var(--neutral-300)]">
                                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-6 w-full">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-[var(--text-primary)] line-clamp-2">{item.name}</h3>
                                            <p className="font-medium text-[var(--primary-600)] mt-1 text-lg">₹{item.price}</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center border border-[var(--border-default)] rounded-md bg-[var(--bg-body)]">
                                                <button 
                                                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                    className="px-3 py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-100)] transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="px-3 py-1 text-sm font-medium border-x border-[var(--border-default)] w-10 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button 
                                                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.stock}
                                                    className="px-3 py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--neutral-100)] transition-colors disabled:opacity-50"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => removeFromCart(item.product_id)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Remove item"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="md:col-span-5 lg:col-span-4 w-full sticky top-24 self-start">
                            <Card padding="lg" className="w-full">
                                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">Order Summary</h3>
                                
                                <div className="space-y-4 text-sm mb-6">
                                    <div className="flex justify-between text-[var(--text-secondary)]">
                                        <span>Subtotal</span>
                                        <span>₹{cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[var(--text-secondary)]">
                                        <span>Shipping</span>
                                        <span className="text-green-600 font-medium">Free</span>
                                    </div>
                                    <div className="pt-4 border-t border-[var(--border-default)] flex justify-between font-bold text-[var(--text-primary)] text-lg">
                                        <span>Total</span>
                                        <span>₹{cartTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <Button 
                                    fullWidth 
                                    size="lg"
                                    onClick={handlePlaceOrder}
                                    disabled={isSubmitting}
                                    className="relative overflow-hidden group"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        "Place Order"
                                    )}
                                </Button>
                                
                                <p className="text-xs text-center text-[var(--text-muted)] mt-4">
                                    By placing your order, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
