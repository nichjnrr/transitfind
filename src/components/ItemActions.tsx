// src/components/ItemActions.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ItemActions({
  itemId,
  status,
}: {
  itemId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const markResolved = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Could not update");
        return;
      }
      toast.success("Marked as resolved");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async () => {
    if (!confirm("Delete this report? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
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

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {status !== "CLOSED" && (
        <button
          onClick={markResolved}
          disabled={loading}
          style={{
            fontSize: 13,
            color: "var(--accent-3)",
            fontWeight: 500,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Mark resolved
        </button>
      )}
      <button
        onClick={deleteReport}
        disabled={loading}
        style={{
          fontSize: 13,
          color: "var(--accent)",
          fontWeight: 500,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        Delete
      </button>
    </div>
  );
}
