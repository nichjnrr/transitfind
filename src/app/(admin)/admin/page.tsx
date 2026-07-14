// src/app/(admin)/admin/page.tsx
import { prisma } from "@/lib/prisma";
import AdminItemActions from "@/components/AdminItemActions";

export default async function AdminOverviewPage() {
  // Platform-wide counts and insights.
  const [
    totalUsers,
    totalLost,
    totalFound,
    openLost,
    matchedLost,
    approvedMatches,
    lostByCategory,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.lostItem.count(),
    prisma.foundItem.count(),
    prisma.lostItem.count({ where: { status: "OPEN" } }),
    prisma.lostItem.count({ where: { status: "MATCHED" } }),
    prisma.match.count({ where: { status: "APPROVED" } }),
    prisma.lostItem.groupBy({
      by: ["category"],
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
    }),
  ]);

  // Recovery rate: matched lost items over total lost items.
  const recoveryRate = totalLost > 0 ? Math.round((matchedLost / totalLost) * 100) : 0;

  // Recent reports across ALL users, for moderation.
  const recentLost = await prisma.lostItem.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { user: { select: { name: true, email: true } } },
  });
  const recentFound = await prisma.foundItem.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { user: { select: { name: true, email: true } } },
  });

  const stats = [
    { label: "Total Users", value: totalUsers, color: "var(--accent)" },
    { label: "Lost Reports", value: totalLost, color: "var(--accent-2)" },
    { label: "Found Reports", value: totalFound, color: "var(--accent-3)" },
    { label: "Open Lost", value: openLost, color: "var(--accent)" },
    { label: "Approved Matches", value: approvedMatches, color: "var(--accent-3)" },
    { label: "Recovery Rate", value: `${recoveryRate}%`, color: "var(--accent-2)" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Overview</h1>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 14,
          marginBottom: 32,
        }}
      >
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div style={{ fontSize: 30, fontWeight: 700, color: s.color, fontFamily: "'Space Mono', monospace" }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Lost by category insight */}
      <div className="card" style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
          Most lost categories
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {lostByCategory.map((row) => {
            const count = row._count.category;
            const pct = totalLost > 0 ? Math.round((count / totalLost) * 100) : 0;
            return (
              <div key={row.category} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 110, fontSize: 13 }}>
                  {row.category.charAt(0) + row.category.slice(1).toLowerCase()}
                </div>
                <div style={{ flex: 1, background: "var(--border)", borderRadius: 6, height: 16, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, background: "var(--accent-2)", height: "100%" }} />
                </div>
                <div style={{ width: 40, fontSize: 13, textAlign: "right", color: "var(--text-muted)" }}>
                  {count}
                </div>
              </div>
            );
          })}
          {lostByCategory.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No lost reports yet.</p>
          )}
        </div>
      </div>

      {/* All lost reports (moderation) */}
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
        All lost reports
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {recentLost.map((item) => (
          <div
            key={item.id}
            className="card"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {item.category} · {item.location} · by {item.user.name} ({item.user.email})
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className={`tag tag-${item.status.toLowerCase()}`}>{item.status}</span>
              <AdminItemActions itemId={item.id} itemType="lost" status={item.status} />
            </div>
          </div>
        ))}
        {recentLost.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No lost reports.</p>
        )}
      </div>

      {/* All found reports (moderation) */}
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
        All found reports
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {recentFound.map((item) => (
          <div
            key={item.id}
            className="card"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {item.category} · {item.location} · by {item.user.name} ({item.user.email})
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className={`tag tag-${item.status.toLowerCase()}`}>{item.status}</span>
              <AdminItemActions itemId={item.id} itemType="found" status={item.status} />
            </div>
          </div>
        ))}
        {recentFound.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No found reports.</p>
        )}
      </div>
    </div>
  );
}
