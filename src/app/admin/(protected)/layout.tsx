import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/actions/auth";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.adminId) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f9]">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-[#16182a] flex flex-col fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-brand-400 text-lg leading-none select-none">✿</span>
            <div>
              <p className="text-white font-bold text-sm leading-tight">oxastore</p>
              <p className="text-slate-500 text-xs">admin panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <AdminSidebarNav />

        {/* Bottom: user + logout */}
        <div className="px-4 py-4 border-t border-white/5">
          <p className="text-xs text-slate-500 truncate mb-3 px-1">{session.email}</p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span className="text-base">⬡</span>
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
