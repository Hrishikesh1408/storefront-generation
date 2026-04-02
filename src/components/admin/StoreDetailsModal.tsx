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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Merchant Store Details"
    >
      {loading ? (
        <div className="p-4 text-center">Loading store details...</div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{error}</div>
      ) : !store ? (
        <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg">
          This merchant has not configured a store yet.
        </div>
      ) : (
        <div className="space-y-1">
          {store.logo && (
            <div className="flex justify-center mb-6">
              <Image src={store.logo} alt="Store Logo" width={80} height={80} className="rounded-full object-cover shadow-sm border" />
            </div>
          )}
          <div className="grid grid-cols-3 border-b py-3">
            <span className="font-semibold text-gray-600">Name</span>
            <span className="col-span-2 text-gray-800">{store.name}</span>
          </div>
          <div className="grid grid-cols-3 border-b py-3">
            <span className="font-semibold text-gray-600">Category</span>
            <span className="col-span-2 capitalize text-gray-800">{store.category || "N/A"}</span>
          </div>
          <div className="grid grid-cols-3 border-b py-3">
            <span className="font-semibold text-gray-600">Status</span>
            <span className="col-span-2 capitalize">
              <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${store.status === 'active' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                {store.status || "N/A"}
              </span>
            </span>
          </div>
          <div className="grid grid-cols-3 py-3">
            <span className="font-semibold text-gray-600">Description</span>
            <span className="col-span-2 text-gray-700 leading-relaxed">{store.description || "N/A"}</span>
          </div>
        </div>
      )}
      <div className="flex justify-end mt-8">
        <button
          onClick={onClose}
          className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-medium shadow hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
