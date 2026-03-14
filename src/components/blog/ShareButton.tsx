"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

interface Props {
  title: string;
}

export default function ShareButton({ title }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled — do nothing
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-4 py-2 transition-colors"
    >
      <Icon icon={copied ? "mdi:check" : "mdi:share-variant"} className="text-base" />
      {copied ? "Link disalin!" : "Bagikan"}
    </button>
  );
}
