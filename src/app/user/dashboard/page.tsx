"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import logo from "@/src/assets/images/newturbifylogo.png";
import Card from "@/src/components/ui/Card/Card";
import Badge from "@/src/components/ui/Badge/Badge";
import Spinner from "@/src/components/ui/Spinner/Spinner";
import EmptyState from "@/src/components/ui/EmptyState/EmptyState";
import ProfileDropdown from "@/src/components/auth/ProfileDropdown";

interface Store {
  _id: string;
  name: string;
  category: string;
  description: string;
  status: string;
  logo?: string;
}

export default function UserDashboard() {
  const [stores, setStores] = useState<Store[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stores' | 'orders'>('stores');

  useEffect(() => {
    async function fetchData() {
      try {
        const [storesRes, ordersRes] = await Promise.all([
            fetch("/api/store/active/all"),
            fetch("/api/order/my-orders")
        ]);
        
        if (storesRes.ok) {
          const data = await storesRes.json();
          setStores(data);
        }
        
        if (ordersRes.ok) {
            const data = await ordersRes.json();
            setOrders(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-body)] flex flex-col">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-[var(--border-default)] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <Image src={logo} alt="Turbify" className="w-28 h-auto" priority />
        <ProfileDropdown />
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-12 md:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-8 animate-slide-up flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-default)] pb-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              User Dashboard
            </h1>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Explore stores and track your orders.
            </p>
          </div>
          <div className="flex gap-2 bg-[var(--neutral-100)] p-1 rounded-lg w-fit">
              <button 
                onClick={() => setActiveTab('stores')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'stores' ? 'bg-white text-[var(--primary-600)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                  Active Stores
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-white text-[var(--primary-600)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                  Order History
              </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : activeTab === 'stores' ? (
            stores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {stores.map((store) => (
                  <Link key={store._id} href={`/store/${store._id}`}>
                    <Card hover className="h-full flex flex-col transition-all duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 rounded-xl bg-[var(--primary-50)] text-[var(--primary-600)] flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 shadow-sm border border-[var(--primary-100)]">
                          {store.logo ? (
                            <img 
                              src={store.logo} 
                              alt={store.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            store.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <Badge variant="success" dot>Active</Badge>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--primary-600)] transition-colors">
                          {store.name}
                        </h3>
                        {store.category && (
                          <span className="inline-block px-2 py-1 bg-[var(--neutral-100)] text-xs text-[var(--text-secondary)] rounded mb-3">
                            {store.category}
                          </span>
                        )}
                        <p className="text-sm text-[var(--text-muted)] line-clamp-3">
                          {store.description || "No description provided."}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="max-w-2xl mx-auto">
                <EmptyState
                  title="No Active Stores"
                  description="There are currently no active storefronts to display. Check back later."
                />
              </Card>
            )
        ) : (
            orders.length > 0 ? (
                <div className="space-y-4 animate-fade-in">
                    {orders.map((order) => (
                        <Card key={order._id} padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-bold font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
                                        #{order._id.substring(order._id.length - 6).toUpperCase()}
                                    </span>
                                    <span className="text-xs text-neutral-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="text-sm text-[var(--text-secondary)]">
                                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-xs text-[var(--text-secondary)]">Total</div>
                                    <div className="font-bold text-[var(--text-primary)]">₹{order.total_amount.toFixed(2)}</div>
                                </div>
                                <Badge variant="success" dot>{order.status}</Badge>
                                <Link href={`/store/${order.store_id}`} className="text-sm font-medium text-[var(--primary-600)] hover:underline">
                                    View Store &rarr;
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="max-w-2xl mx-auto">
                <EmptyState
                  title="No Orders Yet"
                  description="You haven't placed any orders. Discover active stores to start shopping."
                />
              </Card>
            )
        )}
      </main>
    </div>
  );
}
