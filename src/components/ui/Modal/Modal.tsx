/**
 * Props for the Modal component.
 */
type ModalProps = {
  /** Controls the visibility of the modal */
  isOpen: boolean;
  /** Callback fired when the modal requests to be closed */
  onClose: () => void;
  /** Optional callback fired when explicitly saving (if applicable, though close is generic) */
  onSave?: () => void;
  /** Title text displayed in the modal header */
  title: string;
  /** Content to render inside the modal body */
  children: React.ReactNode;
};

/**
 * A controlled, accessible modal dialog component used for overlays.
 *
 * @param {ModalProps} props - The properties for the Modal component.
 * @returns {JSX.Element | null} The rendered modal or null if not open.
 */
export default function Modal({
  isOpen,
  onClose,
  onSave,
  title,
  children,
}: ModalProps) {
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

          {/* Close trigger button */}
          <button onClick={onClose}>×</button>
        </div>

        {/* BODY */}
        <div className="p-4 overflow-auto text-sm">{children}</div>
      </div>
    </div>
  );
}
