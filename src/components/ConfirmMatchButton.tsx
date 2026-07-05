// src/components/ConfirmMatchButton.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ConfirmMatchButton({
  lostItemId,
  foundItemId,
  score,
}: {
  lostItemId: string;
  foundItemId: string;
  score: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    if (!window.confirm("Confirm this is your item? Both reports will be marked as matched.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/items/${lostItemId}/confirm-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foundItemId, score }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Could not confirm match");
        return;
      }
      toast.success("Match confirmed! Both reports marked as matched.");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={confirm} disabled={loading} className="btn btn-secondary">
      {loading ? "Confirming…" : "This is mine"}
    </button>
  );
}
