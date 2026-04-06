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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStores() {
      try {
        const response = await fetch("/api/store/active/all");
        if (response.ok) {
          const data = await response.json();
          setStores(data);
        } else {
          console.error("Failed to fetch active stores");
        }
      } catch (error) {
        console.error("Error fetching active stores:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStores();
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
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Active Stores
          </h1>
          <p className="text-[var(--text-muted)] leading-relaxed">
            Discover all active storefronts on Turbify.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : stores.length > 0 ? (
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
        )}
      </main>
    </div>
  );
}
