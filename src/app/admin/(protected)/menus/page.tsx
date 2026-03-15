import { getAllMenuGroups } from "@/data/menus";
import MenuManager from "@/components/admin/MenuManager";

export default async function MenusPage() {
  const groups = await getAllMenuGroups();

  const headerGroups = groups.filter((g) => g.location === "header");
  const footerGroups = groups.filter((g) => g.location === "footer");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Menu</h1>
      <MenuManager headerGroups={headerGroups} footerGroups={footerGroups} />
    </div>
  );
}
