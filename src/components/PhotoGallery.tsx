// src/components/PhotoGallery.tsx
"use client";
import { useState } from "react";

export default function PhotoGallery({ urls }: { urls: string[] }) {
  const [active, setActive] = useState<string | null>(null);

  if (!urls || urls.length === 0) return null;

  return (
    <>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {urls.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => setActive(url)}
            style={{
              padding: 0,
              border: "1px solid var(--border)",
              borderRadius: 8,
              overflow: "hidden",
              cursor: "pointer",
              width: 72,
              height: 72,
              background: "none",
            }}
            aria-label="View photo"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Item photo"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </button>
        ))}
      </div>

      {/* Lightbox: click a thumbnail to see it full size */}
      {active && (
        <div
          onClick={() => setActive(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 24,
            cursor: "zoom-out",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active}
            alt="Item photo enlarged"
            style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: 10, objectFit: "contain" }}
          />
        </div>
      )}
    </>
  );
}
