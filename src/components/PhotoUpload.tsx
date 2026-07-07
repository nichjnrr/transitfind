// src/components/PhotoUpload.tsx
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

const MAX_PHOTOS = 4;
const MAX_SIZE_MB = 5;

export default function PhotoUpload({
  urls,
  onChange,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    if (urls.length + files.length > MAX_PHOTOS) {
      toast.error(`You can upload up to ${MAX_PHOTOS} photos`);
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          toast.error(`${file.name} is larger than ${MAX_SIZE_MB}MB`);
          continue;
        }

        // Unique path so two uploads never collide.
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error } = await supabase.storage
          .from("item-photos")
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (error) {
          console.error(error);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const { data } = supabase.storage.from("item-photos").getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }

      if (newUrls.length > 0) {
        onChange([...urls, ...newUrls]);
        toast.success(`${newUrls.length} photo${newUrls.length > 1 ? "s" : ""} uploaded`);
      }
    } finally {
      setUploading(false);
      e.target.value = ""; // reset so the same file can be picked again
    }
  };

  const remove = (url: string) => {
    onChange(urls.filter((u) => u !== url));
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        {urls.map((url) => (
          <div
            key={url}
            style={{ position: "relative", width: 84, height: 84, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Uploaded" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button
              type="button"
              onClick={() => remove(url)}
              aria-label="Remove photo"
              style={{
                position: "absolute", top: 2, right: 2,
                background: "rgba(0,0,0,0.6)", color: "#fff", border: "none",
                borderRadius: "50%", width: 20, height: 20, cursor: "pointer",
                fontSize: 12, lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {urls.length < MAX_PHOTOS && (
        <label
          className="btn btn-secondary"
          style={{ cursor: uploading ? "not-allowed" : "pointer", display: "inline-block" }}
        >
          {uploading ? "Uploading…" : "+ Add photos"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            disabled={uploading}
            style={{ display: "none" }}
          />
        </label>
      )}
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
        Up to {MAX_PHOTOS} photos, {MAX_SIZE_MB}MB each. Photos help finders identify your item.
      </p>
    </div>
  );
}
