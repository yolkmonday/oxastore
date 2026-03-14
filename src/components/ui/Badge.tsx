import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "cart" | "discount" | "free";
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  cart: "bg-orange-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5",
  discount: "bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded",
  free: "bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded",
};

export default function Badge({
  variant = "cart",
  children,
  className,
}: BadgeProps) {
  return (
    <span className={cn(variantClasses[variant], className)}>{children}</span>
  );
}
