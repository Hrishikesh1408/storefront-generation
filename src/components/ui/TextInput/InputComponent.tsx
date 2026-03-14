"use client";

import { useState } from "react";

interface InputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  clearable?: boolean;
  onClear?: () => void;
}

export default function Input({
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  size = "md",
  className = "",
  clearable = false,
  onClear
}: InputProps) {

  const sizeStyles = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-5 py-4 text-lg"
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