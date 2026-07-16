// src/app/(dashboard)/items/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ShareButton from "@/components/ShareButton";

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const item = await prisma.lostItem.findUnique({
    where: { id: params.id },
    include: { user: { select: { name: true } } },
  });

  if (!item) notFound();

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>{item.title}</h1>
          <span className={`tag tag-${item.transportMode.toLowerCase()}`}>{item.transportMode}</span>
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>{item.description}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "var(--text-muted)" }}>
          <div>📍 {item.location}</div>
          <div>🕐 {new Date(item.dateTimeOfLoss).toLocaleString("en-SG", { dateStyle: "long", timeStyle: "short" })}</div>
          <div>👤 Reported by {item.user.name}</div>
          <div>📧 Contact: {item.contactEmail}</div>
        </div>

        <div style={{ paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className={`tag tag-${item.status.toLowerCase()}`}>{item.status}</span>
          <ShareButton itemId={item.id} itemTitle={item.title} />
        </div>
      </div>
    </div>
  );
}