"use client";

import { useActionState } from "react";
import { Icon } from "@iconify/react";
import { changeUserPasswordAction } from "@/actions/user-password";
import Button from "@/components/ui/Button";

export default function ChangePasswordForm() {
  const [state, action] = useActionState(changeUserPasswordAction, undefined);

  return (
    <form action={action} className="space-y-4 max-w-lg">
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          Password berhasil diubah.
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Minimal 8 karakter"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
        <input
          type="password"
          name="confirm"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Ulangi password baru"
        />
      </div>
      <Button type="submit" variant="dark">
        Ubah Password
        <Icon icon="mdi:lock-reset" />
      </Button>
    </form>
  );
}
