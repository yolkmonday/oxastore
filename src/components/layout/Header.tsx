"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { useCart } from "@/context/CartContext";
import Badge from "@/components/ui/Badge";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import UserNav from "@/components/layout/UserNav";
import type { MenuItem } from "@/types";

interface HeaderProps {
  userEmail?: string | null;
  menuItems?: MenuItem[];
}

export default function Header({ userEmail, menuItems = [] }: HeaderProps) {
  const { getCartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const count = getCartCount();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/">
          <Image src="/oxa-logo.png" alt="OXA Matter" height={32} width={160} className="h-8 w-auto" priority />
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.url}
                target={item.open_new_tab ? "_blank" : undefined}
                rel={item.open_new_tab ? "noopener noreferrer" : undefined}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          <SearchBar className="w-48" />
          <Link href="/cart" className="relative">
            <Icon
              icon="mdi:cart-outline"
              className="text-2xl text-gray-700 hover:text-gray-900"
            />
            {count > 0 && (
              <Badge
                variant="cart"
                className="absolute -top-2 -right-2"
              >
                {count}
              </Badge>
            )}
          </Link>
          {userEmail ? (
            <UserNav email={userEmail} />
          ) : (
            <>
              <Link href="/masuk">
                <Button variant="ghost">Masuk</Button>
              </Link>
              <Link href="/masuk">
                <Button variant="dark" size="sm">Daftar</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
        >
          <Icon
            icon={menuOpen ? "mdi:close" : "mdi:menu"}
            className="text-2xl text-gray-700"
          />
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-6 py-4 space-y-4">
          <SearchBar className="w-full" />
          <ul className="space-y-3">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.url}
                  target={item.open_new_tab ? "_blank" : undefined}
                  rel={item.open_new_tab ? "noopener noreferrer" : undefined}
                  className="text-sm text-gray-600"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative" onClick={() => setMenuOpen(false)}>
              <Icon icon="mdi:cart-outline" className="text-2xl text-gray-700" />
              {count > 0 && (
                <Badge variant="cart" className="absolute -top-2 -right-2">
                  {count}
                </Badge>
              )}
            </Link>
            {userEmail ? (
              <UserNav email={userEmail} />
            ) : (
              <>
                <Link href="/masuk">
                  <Button variant="ghost">Masuk</Button>
                </Link>
                <Link href="/masuk">
                  <Button variant="dark" size="sm">Daftar</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
