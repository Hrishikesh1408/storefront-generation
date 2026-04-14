"use client";

import Link from "next/link";
import Modal from "@/src/components/ui/Modal/Modal";
import Badge from "@/src/components/ui/Badge/Badge";

interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  store_id: string;
  store_name?: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
  created_at: string;
}

interface OrderModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderModal({ order, onClose }: OrderModalProps) {
  if (!order) return null;

  return (
    <Modal
      isOpen={!!order}
      onClose={onClose}
      title={`Order #${order._id.substring(order._id.length - 6).toUpperCase()}`}
      size="md"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--neutral-100)] transition-colors"
          >
            Close
          </button>
          <Link
            href={`/store/${order.store_id}`}
            className="flex items-center gap-2 px-5 py-2 bg-[var(--primary-600,#4f46e5)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm"
          >
            Go to Store →
          </Link>
        </>
      }
    >
      {/* Meta row */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm text-[var(--text-secondary)]">
          {new Date(order.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        <Badge variant="success" dot>
          {order.status}
        </Badge>
      </div>

      {/* Items list */}
      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
        Items
      </p>
      <div className="space-y-2 mb-6">
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-[var(--neutral-50,#f9fafb)] rounded-lg px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">{item.name}</p>
              <p className="text-xs text-[var(--text-muted)]">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              ₹{(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Order total */}
      <div className="flex items-center justify-between border-t border-[var(--border-default)] pt-4">
        <span className="text-sm font-medium text-[var(--text-secondary)]">Order Total</span>
        <span className="text-lg font-bold text-[var(--text-primary)]">
          ₹{order.total_amount.toFixed(2)}
        </span>
      </div>
    </Modal>
  );
}
