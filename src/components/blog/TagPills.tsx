import Link from "next/link";
import { Tag } from "@/types";

interface Props {
  tags: Tag[];
}

export default function TagPills({ tags }: Props) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/blog?tag=${tag.slug}`}
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
