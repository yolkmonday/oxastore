"use client";

import { useActionState } from "react";
import { Icon } from "@iconify/react";
import { updateProfileAction } from "@/actions/profile";
import { Profile } from "@/types";
import Button from "@/components/ui/Button";

export default function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, action] = useActionState(updateProfileAction, undefined);

  return (
    <form action={action} className="space-y-4 max-w-lg">
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          Profil berhasil disimpan.
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
        <input
          type="text"
          name="full_name"
          defaultValue={profile?.full_name ?? ""}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP</label>
        <input
          type="tel"
          name="phone"
          defaultValue={profile?.phone ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="08xxxxxxxxxx"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
        <textarea
          name="address"
          defaultValue={profile?.address ?? ""}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          placeholder="Jl. Contoh No. 1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
        <input
          type="text"
          name="city"
          defaultValue={profile?.city ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Jakarta"
        />
      </div>
      <Button type="submit" variant="dark">
        Simpan Perubahan
        <Icon icon="mdi:content-save-outline" />
      </Button>
    </form>
  );
}
