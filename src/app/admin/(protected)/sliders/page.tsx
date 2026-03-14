import Link from "next/link";
import { getAllSliders } from "@/data/sliders";
import DeleteSliderButton from "@/components/admin/DeleteSliderButton";

export const dynamic = "force-dynamic";

export default async function AdminSlidersPage() {
  const sliders = await getAllSliders();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Slider</h1>
        <Link
          href="/admin/sliders/new"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800"
        >
          + Tambah Slider
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Gambar</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Judul</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Urutan</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sliders.map((slider) => (
              <tr key={slider.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <img
                    src={slider.image}
                    alt={slider.title ?? "Slider"}
                    className="w-24 h-14 object-cover rounded"
                  />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {slider.title || <span className="text-gray-400 italic">Tanpa judul</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">{slider.sortOrder}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      slider.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {slider.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/sliders/${slider.id}/edit`}
                      className="text-brand-600 hover:text-brand-800 font-medium"
                    >
                      Edit
                    </Link>
                    <DeleteSliderButton id={slider.id} title={slider.title} />
                  </div>
                </td>
              </tr>
            ))}
            {sliders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Belum ada slider. Tambah slider pertama.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
