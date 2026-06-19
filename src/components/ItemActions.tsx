// src/components/ItemActions.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ItemActions({
  itemId,
  status,
  itemType = "lost",
}: {
  itemId: string;
  status: string;
  itemType?: "lost" | "found";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Lost items use /api/items/[id]; found items use /api/found-items/[id].
  const endpoint =
    itemType === "found" ? `/api/found-items/${itemId}` : `/api/items/${itemId}`;

  const baseBtn: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  };

  const markResolved = async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
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
      const res = await fetch(endpoint, { method: "DELETE" });
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
    <div className="row-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {status !== "CLOSED" && (
        <button onClick={markResolved} disabled={loading} style={{ ...baseBtn, color: "var(--accent-3)" }}>
          Mark resolved
        </button>
      )}
      <button onClick={deleteReport} disabled={loading} style={{ ...baseBtn, color: "var(--accent)" }}>
        Delete
      </button>
    </div>
  );
}
