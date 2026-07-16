"use client";
import { useState } from "react";

export default function ShareButton({ itemId, itemTitle }: { itemId: string; itemTitle: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/items/${itemId}`;

    if (navigator.share) {
      // Mobile native share sheet
      try {
        await navigator.share({ title: `Lost item: ${itemTitle}`, url });
      } catch {}
      return;
    }

    // Desktop: copy to clipboard
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      title="Share item link"
      style={{
        background: "transparent",
        border: "1.5px solid var(--border)",
        borderRadius: 8,
        padding: "4px 10px",
        cursor: "pointer",
        fontSize: 12,
        color: "var(--text-muted)",
        fontFamily: "inherit",
        fontWeight: 500,
        transition: "all 0.15s",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      {copied ? "✅ Copied!" : "🔗 Share"}
    </button>
  );
}