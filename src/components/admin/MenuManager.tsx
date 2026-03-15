"use client";

import { useState, useTransition } from "react";
import { Icon } from "@iconify/react";
import type { MenuGroup, MenuLocation } from "@/types";
import {
  createGroupAction,
  updateGroupAction,
  deleteGroupAction,
  createItemAction,
  updateItemAction,
  deleteItemAction,
} from "@/actions/menus";

interface Props {
  headerGroups: MenuGroup[];
  footerGroups: MenuGroup[];
}

export default function MenuManager({ headerGroups, footerGroups }: Props) {
  const [tab, setTab] = useState<MenuLocation>("header");
  const groups = tab === "header" ? headerGroups : footerGroups;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["header", "footer"] as const).map((loc) => (
          <button
            key={loc}
            onClick={() => setTab(loc)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              tab === loc
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {loc === "header" ? "Header" : "Footer"}
          </button>
        ))}
      </div>

      {/* Groups */}
      <div className="space-y-6">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>

      {/* Add group (footer only — header has a single implicit group) */}
      {tab === "footer" && <AddGroupForm location="footer" />}
      {tab === "header" && groups.length === 0 && (
        <AddGroupForm location="header" />
      )}
    </div>
  );
}

function GroupCard({ group }: { group: MenuGroup }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isFooter = group.location === "footer";

  function handleDeleteGroup() {
    if (!confirm("Hapus grup ini beserta semua item di dalamnya?")) return;
    startTransition(async () => {
      await deleteGroupAction(group.id);
    });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Group header */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
        {editing ? (
          <GroupEditForm
            group={group}
            onDone={() => setEditing(false)}
          />
        ) : (
          <>
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-gray-900">
                {group.title || (group.location === "header" ? "Header Menu" : "Grup Tanpa Judul")}
              </h3>
              <span className="text-xs text-gray-400">
                Urutan: {group.sort_order}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isFooter && (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Edit grup"
                  >
                    <Icon icon="mdi:pencil-outline" className="text-lg" />
                  </button>
                  <button
                    onClick={handleDeleteGroup}
                    disabled={isPending}
                    className="text-gray-400 hover:text-red-500 p-1 disabled:opacity-50"
                    title="Hapus grup"
                  >
                    <Icon icon="mdi:delete-outline" className="text-lg" />
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-100">
        {group.items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
        {group.items.length === 0 && (
          <p className="px-5 py-4 text-sm text-gray-400">Belum ada item.</p>
        )}
      </div>

      {/* Add item */}
      <AddItemForm groupId={group.id} />
    </div>
  );
}

function GroupEditForm({
  group,
  onDone,
}: {
  group: MenuGroup;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateGroupAction(group.id, formData);
      onDone();
    });
  }

  return (
    <form action={handleSubmit} className="flex items-center gap-2 flex-1">
      <input
        name="title"
        defaultValue={group.title ?? ""}
        placeholder="Judul grup"
        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <input
        name="sort_order"
        type="number"
        defaultValue={group.sort_order}
        className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <button
        type="submit"
        disabled={isPending}
        className="text-sm text-white bg-gray-900 px-3 py-1 rounded hover:bg-gray-800 disabled:opacity-50"
      >
        Simpan
      </button>
      <button
        type="button"
        onClick={onDone}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Batal
      </button>
    </form>
  );
}

function ItemRow({ item }: { item: import("@/types").MenuItem }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Hapus item "${item.label}"?`)) return;
    startTransition(async () => {
      await deleteItemAction(item.id);
    });
  }

  if (editing) {
    return (
      <ItemEditForm item={item} onDone={() => setEditing(false)} />
    );
  }

  return (
    <div className="flex items-center justify-between px-5 py-3 group">
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-300 w-6 text-center">
          {item.sort_order}
        </span>
        {item.icon && (
          <Icon icon={item.icon} className="text-lg text-gray-400" />
        )}
        <span className="text-sm text-gray-800">{item.label}</span>
        <span className="text-xs text-gray-400 font-mono">{item.url}</span>
        {item.open_new_tab && (
          <span title="Buka di tab baru">
            <Icon
              icon="mdi:open-in-new"
              className="text-xs text-gray-300"
            />
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <Icon icon="mdi:pencil-outline" className="text-base" />
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-gray-400 hover:text-red-500 p-1 disabled:opacity-50"
        >
          <Icon icon="mdi:delete-outline" className="text-base" />
        </button>
      </div>
    </div>
  );
}

function ItemEditForm({
  item,
  onDone,
}: {
  item: import("@/types").MenuItem;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateItemAction(item.id, formData);
      onDone();
    });
  }

  return (
    <form action={handleSubmit} className="px-5 py-3 space-y-2 bg-gray-50">
      <div className="grid grid-cols-12 gap-2">
        <input
          name="label"
          defaultValue={item.label}
          placeholder="Label"
          className="col-span-3 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          name="url"
          defaultValue={item.url}
          placeholder="URL"
          className="col-span-3 border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          name="icon"
          defaultValue={item.icon ?? ""}
          placeholder="Icon (mdi:...)"
          className="col-span-2 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          name="sort_order"
          type="number"
          defaultValue={item.sort_order}
          className="col-span-1 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <label className="col-span-1 flex items-center gap-1 text-xs text-gray-500">
          <input
            type="checkbox"
            name="open_new_tab"
            value="true"
            defaultChecked={item.open_new_tab}
            className="rounded"
          />
          Tab baru
        </label>
        <div className="col-span-2 flex items-center gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="text-sm text-white bg-gray-900 px-3 py-1.5 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={onDone}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Batal
          </button>
        </div>
      </div>
    </form>
  );
}

function AddItemForm({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <div className="px-5 py-3 border-t border-gray-100">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
        >
          <Icon icon="mdi:plus" className="text-base" />
          Tambah item
        </button>
      </div>
    );
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createItemAction(formData);
      setOpen(false);
    });
  }

  return (
    <form
      action={handleSubmit}
      className="px-5 py-3 border-t border-gray-100 bg-gray-50 space-y-2"
    >
      <input type="hidden" name="group_id" value={groupId} />
      <div className="grid grid-cols-12 gap-2">
        <input
          name="label"
          placeholder="Label"
          required
          className="col-span-3 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          name="url"
          placeholder="URL (misal /tentang)"
          required
          className="col-span-3 border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          name="icon"
          placeholder="Icon (mdi:...)"
          className="col-span-2 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <label className="col-span-2 flex items-center gap-1 text-xs text-gray-500">
          <input
            type="checkbox"
            name="open_new_tab"
            value="true"
            className="rounded"
          />
          Buka di tab baru
        </label>
        <div className="col-span-2 flex items-center gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="text-sm text-white bg-gray-900 px-3 py-1.5 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            Tambah
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Batal
          </button>
        </div>
      </div>
    </form>
  );
}

function AddGroupForm({ location }: { location: MenuLocation }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
      >
        <Icon icon="mdi:plus" className="text-base" />
        Tambah grup {location}
      </button>
    );
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createGroupAction(formData);
      setOpen(false);
    });
  }

  return (
    <form
      action={handleSubmit}
      className="mt-4 bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3"
    >
      <input type="hidden" name="location" value={location} />
      <input
        name="title"
        placeholder="Judul grup baru"
        required
        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <button
        type="submit"
        disabled={isPending}
        className="text-sm text-white bg-gray-900 px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
      >
        Tambah
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Batal
      </button>
    </form>
  );
}
