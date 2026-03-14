"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { getBestSellers } from "@/data/books";
import CartTable from "@/components/cart/CartTable";
import CartSummary from "@/components/cart/CartSummary";
import FreeShippingBanner from "@/components/cart/FreeShippingBanner";
import BestSellerCard from "@/components/books/BestSellerCard";

export default function CartPage() {
  const bestSellers = getBestSellers();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Cart.</h1>
      <p className="text-gray-500 mb-10">
        Review your curated selection before checkout.
      </p>

      <div className="lg:flex lg:gap-12 mb-12">
        <div className="lg:w-2/3 mb-8 lg:mb-0">
          <CartTable />

          <div className="mt-8 space-y-6">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              <Icon icon="mdi:arrow-left" className="text-base" />
              BACK TO LIBRARY
            </Link>

            <FreeShippingBanner />
          </div>
        </div>

        <div className="lg:w-1/3">
          <CartSummary />
        </div>
      </div>

      <section className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Our Best Sellers.
          </h2>
          <Link
            href="/books"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View all books
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {bestSellers.map((book) => (
            <BestSellerCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
}
