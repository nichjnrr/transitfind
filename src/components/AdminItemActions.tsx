// src/components/AdminItemActions.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminItemActions({
  itemId,
  itemType,
  status,
}: {
  itemId: string;
  itemType: "lost" | "found";
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const base = `/api/admin/items/${itemId}?type=${itemType}`;

  const close = async () => {
    setLoading(true);
    try {
      const res = await fetch(base, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Could not close");
        return;
      }
      toast.success("Report closed");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this report permanently? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(base, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Could not delete");
        return;
      }
      toast.success("Report deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const btn: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 500,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {status !== "CLOSED" && (
        <button onClick={close} disabled={loading} style={{ ...btn, color: "var(--accent-3)" }}>
          Close
        </button>
      )}
      <button onClick={remove} disabled={loading} style={{ ...btn, color: "var(--accent)" }}>
        Delete
      </button>
    </div>
  );
}
