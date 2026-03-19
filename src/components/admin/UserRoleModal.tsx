import Modal from "@/src/components/ui/Modal/Modal";

type Props = {
  user: any;
  isOpen: boolean;
  onClose: () => void;
};

export default function UserRoleModal({ user, isOpen, onClose }: Props) {
  const handleSave = () => {
    console.log("Save clicked");
    onClose(); // close after save
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
    <select className="w-full border p-2 rounded">
      <option>admin</option>
      <option>merchant</option>
      <option>user</option>
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