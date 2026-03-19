type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave?: () => void;   // ✅ add this
    title: string;
    children: React.ReactNode;
};

export default function Modal({ isOpen, onClose, onSave, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-[600px] max-h-[80vh] rounded shadow-lg flex flex-col"
            >
                {/* HEADER */}
                <div className="bg-blue-500 text-white px-4 py-3 flex justify-between">
                    <span className="font-semibold">{title}</span>

                    {/* ✅ X BUTTON = SAVE */}
                <button onClick={onSave ? onSave : onClose}>
                    ×
                </button>
            </div>

            {/* BODY */}
            <div className="p-4 overflow-auto text-sm">
                {children}
            </div>
        </div>
    </div>
  );
}