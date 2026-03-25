"use client";

import { useState } from "react";

/**
 * Props for the Text Input component.
 */
interface InputProps {
  /** Identifier and name for the input field */
  name: string;
  /** Current value of the input */
  value: string;
  /** Change event handler */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Placeholder text */
  placeholder?: string;
  /** The HTML type attribute (e.g., text, email, password) */
  type?: string;
  /** Size variant of the input field */
  size?: "sm" | "md" | "lg";
  /** Additional custom class names */
  className?: string;
  /** Whether a clear 'x' button should be shown when it has a value */
  clearable?: boolean;
  /** Optional callback triggered when the clear button is clicked */
  onClear?: () => void;
}

/**
 * A reusable, accessible text input component with a clearable icon option.
 *
 * @param {InputProps} props - The properties for the Input component.
 * @returns {JSX.Element} The rendered input field.
 */
export default function Input({
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  size = "md",
  className = "",
  clearable = false,
  onClear,
}: InputProps) {
  const sizeStyles = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-5 py-4 text-lg",
  };

  return (
    <div className="relative w-full">
      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={`
          w-full
          border
          border-gray-300
          rounded-lg
          outline-none
          focus:ring-2
          focus:ring-blue-500
          focus:border-blue-500
          ${sizeStyles[size]}
          ${className}
        `}
      />

      {clearable && value && (
        <button
          type="button"
          onClick={() => {
            onChange({ target: { value: "" } } as any);
            onClear?.();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          ×
        </button>
      )}
    </div>
  );
}
