import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-bold text-gray-900">oxastore admin</span>
          <Link
            href="/admin/books"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Buku
          </Link>
          <Link
            href="/admin/settings"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Pengaturan
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{session.email}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-red-600 hover:text-red-800 cursor-pointer"
            >
              Keluar
            </button>
          </form>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
