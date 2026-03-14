"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { useCart } from "@/context/CartContext";
import Badge from "@/components/ui/Badge";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";

export default function Header() {
  const { getCartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const count = getCartCount();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-orange-500 text-xl">*</span>
          <span className="text-xl font-bold text-gray-900">oxamatter</span>
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          <li>
            <Link
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/books"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Book
            </Link>
          </li>
          <li>
            <Link
              href="/books?tab=popular"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Popular
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Help
            </Link>
          </li>
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
          <Button variant="ghost">Login</Button>
          <Button variant="dark" size="sm">
            Free Trial
          </Button>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
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
            <li>
              <Link href="#" className="text-sm text-gray-600" onClick={() => setMenuOpen(false)}>
                About
              </Link>
            </li>
            <li>
              <Link href="/books" className="text-sm text-gray-600" onClick={() => setMenuOpen(false)}>
                Book
              </Link>
            </li>
            <li>
              <Link href="/books?tab=popular" className="text-sm text-gray-600" onClick={() => setMenuOpen(false)}>
                Popular
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm text-gray-600" onClick={() => setMenuOpen(false)}>
                Help
              </Link>
            </li>
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
            <Button variant="ghost">Login</Button>
            <Button variant="dark" size="sm">
              Free Trial
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
