import { Icon } from "@iconify/react";

export default function FreeShippingBanner() {
  return (
    <div className="bg-blue-600 text-white rounded-xl p-6">
      <div className="flex items-center gap-2 mb-2">
        <Icon icon="mdi:truck-fast" className="text-xl" />
        <h3 className="font-bold text-sm">Free shipping applied.</h3>
      </div>
      <p className="text-sm text-blue-100">
        Your order qualifies for our signature white-glove delivery. Expected to
        arrive in 2-3 business days.
      </p>
    </div>
  );
}
