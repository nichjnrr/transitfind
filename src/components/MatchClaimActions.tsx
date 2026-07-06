// src/components/MatchClaimActions.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function MatchClaimActions({ matchId }: { matchId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const decide = async (decision: "APPROVE" | "REJECT") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Could not update claim");
        return;
      }
      toast.success(decision === "APPROVE" ? "Match approved" : "Claim rejected");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button onClick={() => decide("APPROVE")} disabled={loading} className="btn btn-primary">
        {loading ? "…" : "Approve"}
      </button>
      <button onClick={() => decide("REJECT")} disabled={loading} className="btn btn-secondary">
        Reject
      </button>
    </div>
  );
}
