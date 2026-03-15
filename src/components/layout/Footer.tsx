import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import type { MenuGroup } from "@/types";

interface FooterProps {
  menuGroups?: MenuGroup[];
}

export default function Footer({ menuGroups = [] }: FooterProps) {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-3">
              <Image src="/oxa-logo.png" alt="OXA Matter" height={28} width={140} className="h-7 w-auto grayscale opacity-40" />
            </div>
            <p className="text-sm text-gray-500">
              &copy; 2024 PT OXA Matter Indonesia. Toko buku & penerbit.
            </p>
          </div>

          {menuGroups.map((group) => {
            const hasSocialIcons = group.items.some((item) => item.icon);

            return (
              <div key={group.id}>
                {group.title && (
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-900 mb-4">
                    {group.title}
                  </h4>
                )}
                {hasSocialIcons ? (
                  <div className="flex items-center gap-3">
                    {group.items.map((item) => (
                      <Link
                        key={item.id}
                        href={item.url}
                        target={item.open_new_tab ? "_blank" : undefined}
                        rel={item.open_new_tab ? "noopener noreferrer" : undefined}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label={item.label}
                      >
                        {item.icon ? (
                          <Icon icon={item.icon} className="text-xl" />
                        ) : (
                          <span className="text-sm">{item.label}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={item.url}
                          target={item.open_new_tab ? "_blank" : undefined}
                          rel={item.open_new_tab ? "noopener noreferrer" : undefined}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-center text-xs text-gray-400 uppercase tracking-widest">
            PT OXA Matter Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
