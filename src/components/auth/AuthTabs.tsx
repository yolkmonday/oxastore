"use client";

import { useActionState } from "react";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { registerAction, userLoginAction } from "@/actions/user-auth";
import Button from "@/components/ui/Button";

export default function AuthTabs({ redirectTo }: { redirectTo?: string }) {
  const [tab, setTab] = useState<"masuk" | "daftar">("masuk");

  const [loginState, loginAction] = useActionState(userLoginAction, undefined);
  const [registerState, registerFormAction] = useActionState(registerAction, undefined);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab("masuk")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === "masuk"
              ? "border-b-2 border-brand-500 text-brand-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Masuk
        </button>
        <button
          onClick={() => setTab("daftar")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === "daftar"
              ? "border-b-2 border-brand-500 text-brand-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Daftar
        </button>
      </div>

      {tab === "masuk" ? (
        <form action={loginAction} className="space-y-4">
          {redirectTo && (
            <input type="hidden" name="redirect" value={redirectTo} />
          )}
          {loginState?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {loginState.error}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="email@contoh.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Password"
            />
          </div>
          <Button type="submit" variant="dark" className="w-full" size="lg">
            Masuk
            <Icon icon="mdi:login" className="text-lg" />
          </Button>
        </form>
      ) : (
        <form action={registerFormAction} className="space-y-4">
          {registerState?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {registerState.error}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="email@contoh.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Minimal 8 karakter"
            />
          </div>
          <Button type="submit" variant="dark" className="w-full" size="lg">
            Daftar Sekarang
            <Icon icon="mdi:account-plus" className="text-lg" />
          </Button>
        </form>
      )}
    </div>
  );
}
