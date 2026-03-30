"use client";

import { useState, useEffect } from "react";
import Modal from "@/src/components/ui/Modal/Modal";
import Badge from "@/src/components/ui/Badge/Badge";
import Button from "@/src/components/ui/Button/ButtonComponent";
import Spinner from "@/src/components/ui/Spinner/Spinner";
import Image from "next/image";

type Props = {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function StoreDetailsModal({ userId, isOpen, onClose }: Props) {
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && userId) {
      fetchStoreDetails(userId);
    } else {
      setStore(null);
      setError("");
    }
  }, [isOpen, userId]);

  const fetchStoreDetails = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/store/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch store");
      setStore(data.store);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge variant="success" dot>Active</Badge>;
      case "pending": return <Badge variant="warning" dot>Pending</Badge>;
      case "draft": return <Badge variant="info" dot>Draft</Badge>;
      default: return <Badge variant="neutral" dot>{status || "N/A"}</Badge>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Store Details">
      {loading ? (
        <div className="py-8">
          <Spinner />
        </div>
      ) : error ? (
        <div className="py-6 text-center">
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[var(--danger)]">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 6v5M10 13.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm text-[var(--danger)]">{error}</p>
        </div>
      ) : !store ? (
        <div className="py-8 text-center">
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-[var(--neutral-100)] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[var(--text-muted)]">
              <path d="M3 7l7-5 7 5v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            This merchant has not configured a store yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Store header with logo */}
          {store.logo && (
            <div className="flex justify-center mb-2">
              <Image
                src={store.logo}
                alt="Store Logo"
                width={64}
                height={64}
                className="rounded-full object-cover shadow-sm border border-[var(--border-default)]"
              />
            </div>
          )}

          {/* Info rows */}
          <div className="rounded-[var(--radius-sm)] border border-[var(--border-default)] overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 bg-[var(--neutral-50)]">
              <span className="text-sm font-medium text-[var(--text-muted)]">Name</span>
              <span className="text-sm font-medium text-[var(--text-primary)]">{store.name}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 border-t border-[var(--border-default)]">
              <span className="text-sm font-medium text-[var(--text-muted)]">Category</span>
              <span className="text-sm capitalize text-[var(--text-primary)]">{store.category || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 border-t border-[var(--border-default)] bg-[var(--neutral-50)]">
              <span className="text-sm font-medium text-[var(--text-muted)]">Status</span>
              {getStatusBadge(store.status)}
            </div>
            {store.description && (
              <div className="px-4 py-3 border-t border-[var(--border-default)]">
                <span className="text-sm font-medium text-[var(--text-muted)] block mb-1">Description</span>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                  {store.description}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
