"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/admin/books",
    icon: "mdi:book-open-page-variant-outline",
    label: "Buku",
  },
  {
    href: "/admin/categories",
    icon: "mdi:tag-multiple-outline",
    label: "Kategori",
  },
  {
    href: "/admin/settings",
    icon: "mdi:cog-outline",
    label: "Pengaturan",
  },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 pt-2">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all",
              isActive
                ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            <Icon icon={item.icon} className="text-[18px] flex-shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
