"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { userLogoutAction } from "@/actions/user-auth";

interface UserNavProps {
  email: string;
}

export default function UserNav({ email }: UserNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900"
      >
        <Icon icon="mdi:account-circle" className="text-2xl" />
        <Icon icon="mdi:chevron-down" className="text-base" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1">
            <p className="px-4 py-2 text-xs text-gray-400 truncate border-b border-gray-50">
              {email}
            </p>
            <Link
              href="/akun/pesanan"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <Icon icon="mdi:clipboard-list-outline" />
              Pesanan Saya
            </Link>
            <Link
              href="/akun/profil"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <Icon icon="mdi:account-outline" />
              Profil
            </Link>
            <div className="border-t border-gray-50 mt-1">
              <form action={userLogoutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 cursor-pointer"
                >
                  <Icon icon="mdi:logout" />
                  Keluar
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
