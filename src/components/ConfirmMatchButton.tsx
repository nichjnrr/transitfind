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
    if (
      !window.confirm(
        "Send a claim to the finder that this is your item? They will need to approve it."
      )
    ) {
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
        toast.error(data.error || "Could not send claim");
        return;
      }
      toast.success("Claim sent. The finder will review it.");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={confirm} disabled={loading} className="btn btn-secondary">
      {loading ? "Sending…" : "This is mine — send claim"}
    </button>
  );
}
