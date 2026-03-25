"use client";

/**
 * Props for the Button component.
 */
interface ButtonProps {
  /** The content to display inside the button */
  children: React.ReactNode;
  /** Optional click handler */
  onClick?: () => void;
  /** HTML button type attribute (default: "button") */
  type?: "button" | "submit" | "reset";
  /** Size variant of the button (default: "md") */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes to apply */
  className?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
}

/**
 * A reusable, styled button component with customizable sizes and variants.
 *
 * @param {ButtonProps} props - The properties for the Button component.
 * @returns {JSX.Element} The rendered button element.
 */
export default function Button({
  children,
  onClick,
  type = "button",
  size = "md",
  className = "",
  disabled = false,
}: ButtonProps) {
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-[#0039A7]
        text-white
        rounded-lg
        font-medium
        transition-colors
        duration-200
        hover:bg-blue-700
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
