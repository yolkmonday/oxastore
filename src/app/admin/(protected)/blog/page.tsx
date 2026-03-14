import Link from "next/link";
import { getAllPosts } from "@/data/posts";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await getAllPosts();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
        <Link
          href="/admin/blog/new"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800"
        >
          + Tambah Post
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Judul</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dibuat</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  Belum ada post.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{post.title}</td>
                  <td className="px-4 py-3 font-mono text-gray-500 text-xs">{post.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(post.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="text-brand-600 hover:text-brand-700 font-medium text-sm"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
