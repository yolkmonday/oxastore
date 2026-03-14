import { notFound } from "next/navigation";
import SliderForm from "@/components/admin/SliderForm";
import { updateSliderAction } from "@/actions/sliders";
import { getSliderById } from "@/data/sliders";

export const dynamic = "force-dynamic";

export default async function EditSliderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const slider = await getSliderById(id);
  if (!slider) notFound();

  const boundAction = updateSliderAction.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Slider</h1>
      <SliderForm
        action={boundAction}
        defaultValues={{
          title: slider.title,
          subtitle: slider.subtitle,
          image: slider.image,
          link: slider.link,
          sort_order: slider.sortOrder,
          is_active: slider.isActive,
        }}
        submitLabel="Perbarui"
      />
    </div>
  );
}
