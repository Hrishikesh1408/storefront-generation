import { useState, useEffect } from "react";
import Modal from "@/src/components/ui/Modal/Modal";

type Props = {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (updatedUser: any) => void; // ✅ NEW
};

export default function UserRoleModal({
  user,
  isOpen,
  onClose,
  onSaveSuccess,
}: Props) {

  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role); // preload current role
    }
  }, [user]);

    const handleSave = async () => {
    if (!user) return;

    try {
        const res = await fetch("/api/admin/update-role", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId: user.id,
            role: selectedRole,
        }),
        });

        const data = await res.json();

        if (!res.ok) {
        throw new Error(data.message || "Failed to update role");
        }

        onSaveSuccess({
        ...user,
        role: selectedRole,
        });

        onClose();

    } catch (err: any) {
        console.error(err);
        alert(err.message);
    }
    };
    if (!user) return null;

    return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      title="User Role"
    >
      <p><b>Name:</b> {user.name}</p>
      <p><b>Email:</b> {user.email}</p>
      <p><b>Role:</b> {user.role}</p>

      <div className="mt-4">
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="admin">admin</option>
          <option value="merchant">merchant</option>
          <option value="user">user</option>
        </select>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Save
        </button>
      </div>
    </Modal>
  );
}