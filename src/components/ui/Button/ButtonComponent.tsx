"use client";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

export default function Button({
  children,
  onClick,
  type = "button",
  size = "md",
  className = "",
  disabled = false
}: ButtonProps) {

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
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