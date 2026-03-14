"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/actions/auth";

export default function SettingsPage() {
  const [state, action, pending] = useActionState(
    changePasswordAction,
    undefined
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Ganti Password
        </h2>

        <form action={action} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Saat Ini
            </label>
            <input
              type="password"
              name="currentPassword"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Baru
            </label>
            <input
              type="password"
              name="newPassword"
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-gray-400 mt-1">Minimal 8 karakter.</p>
          </div>

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          {state && !state.error && (
            <p className="text-sm text-green-600">Password berhasil diubah.</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
          >
            {pending ? "Menyimpan..." : "Simpan Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
