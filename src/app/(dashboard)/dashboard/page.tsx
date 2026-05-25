// src/app/(dashboard)/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user!.id as string;

  const [lostCount, totalLost, totalFound] = await Promise.all([
    prisma.lostItem.count({ where: { userId } }),
    prisma.lostItem.count(),
    prisma.foundItem.count(),
  ]);

  const recentItems = await prisma.lostItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Welcome back, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4 }}>
          Here&apos;s an overview of your activity on TransitFind.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 36,
        }}
      >
        {[
          { label: "Your Lost Reports", value: lostCount, color: "var(--accent)" },
          { label: "Total Lost Reports", value: totalLost, color: "var(--accent-2)" },
          { label: "Total Found Reports", value: totalFound, color: "var(--accent-3)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card">
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                fontFamily: "'Space Mono', monospace",
                color,
              }}
            >
              {value}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 12, marginBottom: 36 }}>
        <Link href="/report-lost" className="btn btn-primary">
          + Report Lost Item
        </Link>
        <Link href="/browse" className="btn btn-blue">
          Browse Found Items
        </Link>
      </div>

      {/* Recent reports */}
      <div>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 16,
            letterSpacing: "-0.01em",
          }}
        >
          Your recent reports
        </h2>
        {recentItems.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px 24px" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              You haven&apos;t submitted any lost item reports yet.
            </p>
            <Link href="/report-lost" className="btn btn-primary" style={{ marginTop: 16 }}>
              Report a Lost Item
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentItems.map((item) => (
              <div
                key={item.id}
                className="card"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                    {item.transportMode} · {item.location} ·{" "}
                    {new Date(item.dateTimeOfLoss).toLocaleDateString("en-SG")}
                  </div>
                </div>
                <span className={`tag tag-${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
