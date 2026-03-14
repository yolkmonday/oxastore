"use client";

import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function SearchBar({
  placeholder = "Cari buku...",
  value,
  onChange,
  className,
}: SearchBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2",
        className
      )}
    >
      <Icon icon="mdi:magnify" className="text-gray-400 text-lg" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
      />
    </div>
  );
}
