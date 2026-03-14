import SliderForm from "@/components/admin/SliderForm";
import { createSliderAction } from "@/actions/sliders";

export default function NewSliderPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tambah Slider</h1>
      <SliderForm action={createSliderAction} submitLabel="Tambah" />
    </div>
  );
}
