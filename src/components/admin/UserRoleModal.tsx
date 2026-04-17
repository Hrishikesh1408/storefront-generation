"use client";

import { useState, useEffect } from "react";
import Modal from "@/src/components/ui/Modal/Modal";
import Select from "@/src/components/ui/Select/SelectComponent";
import Button from "@/src/components/ui/Button/ButtonComponent";

type Props = {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (updatedUser: any) => void;
};

export default function UserRoleModal({
  user,
  isOpen,
  onClose,
  onSaveSuccess,
}: Props) {
  const [selectedRole, setSelectedRole] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setSelectedRole(user.role);
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update role");
      onSaveSuccess({ ...user, role: selectedRole });
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
    setSaving(false);
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update User Role" size="sm">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] bg-[var(--neutral-50)]">
            <div className="w-10 h-10 rounded-full bg-[var(--primary-100)] flex items-center justify-center">
              <span className="text-sm font-semibold text-[var(--primary-700)]">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {user.name || "Unknown"}
              </p>
              <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
            </div>
          </div>
        </div>

        <Select
          name="role"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          options={[
            { label: "Merchant", value: "merchant" },
            { label: "User", value: "user" },
          ]}
          label="Assign Role"
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
