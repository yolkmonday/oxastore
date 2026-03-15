import { createSupabaseClient } from "@/lib/supabase";
import { MenuGroup, MenuItem, MenuLocation } from "@/types";

function mapItem(row: Record<string, unknown>): MenuItem {
  return {
    id: row.id as string,
    group_id: row.group_id as string,
    label: row.label as string,
    url: row.url as string,
    icon: (row.icon as string) ?? null,
    open_new_tab: row.open_new_tab as boolean,
    sort_order: row.sort_order as number,
  };
}

function mapGroup(
  row: Record<string, unknown>,
  items: MenuItem[]
): MenuGroup {
  return {
    id: row.id as string,
    location: row.location as MenuLocation,
    title: (row.title as string) ?? null,
    sort_order: row.sort_order as number,
    items,
  };
}

export async function getMenusByLocation(
  location: MenuLocation
): Promise<MenuGroup[]> {
  const supabase = createSupabaseClient();

  const { data: groups } = await supabase
    .from("menu_groups")
    .select("*")
    .eq("location", location)
    .order("sort_order", { ascending: true });

  if (!groups || groups.length === 0) return [];

  const groupIds = groups.map((g) => g.id as string);
  const { data: items } = await supabase
    .from("menu_items")
    .select("*")
    .in("group_id", groupIds)
    .order("sort_order", { ascending: true });

  const itemsByGroup = new Map<string, MenuItem[]>();
  for (const row of items ?? []) {
    const gid = row.group_id as string;
    if (!itemsByGroup.has(gid)) itemsByGroup.set(gid, []);
    itemsByGroup.get(gid)!.push(mapItem(row));
  }

  return groups.map((g) =>
    mapGroup(g, itemsByGroup.get(g.id as string) ?? [])
  );
}

export async function getAllMenuGroups(): Promise<MenuGroup[]> {
  const supabase = createSupabaseClient();

  const { data: groups } = await supabase
    .from("menu_groups")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!groups || groups.length === 0) return [];

  const { data: items } = await supabase
    .from("menu_items")
    .select("*")
    .order("sort_order", { ascending: true });

  const itemsByGroup = new Map<string, MenuItem[]>();
  for (const row of items ?? []) {
    const gid = row.group_id as string;
    if (!itemsByGroup.has(gid)) itemsByGroup.set(gid, []);
    itemsByGroup.get(gid)!.push(mapItem(row));
  }

  return groups.map((g) =>
    mapGroup(g, itemsByGroup.get(g.id as string) ?? [])
  );
}
