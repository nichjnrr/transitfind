// src/app/(dashboard)/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ItemActions from "@/components/ItemActions";
import MatchClaimActions from "@/components/MatchClaimActions";
import ShareButton from "@/components/ShareButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user!.id as string;

  const [lostCount, foundCount, totalLost, totalFound] = await Promise.all([
    prisma.lostItem.count({ where: { userId } }),
    prisma.foundItem.count({ where: { userId } }),
    prisma.lostItem.count(),
    prisma.foundItem.count(),
  ]);

  const recentItems = await prisma.lostItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const recentFoundItems = await prisma.foundItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  // Pending match claims made by others against THIS user's found items.
  const pendingClaims = await prisma.match.findMany({
    where: { status: "PENDING", foundItem: { userId } },
    include: { lostItem: true, foundItem: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Welcome back, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4 }}>
          Here&apos;s an overview of your activity on TransitFind. You have filed{" "}
          <strong>{lostCount}</strong> lost {lostCount === 1 ? "report" : "reports"} and{" "}
          <strong>{foundCount}</strong> found {foundCount === 1 ? "report" : "reports"}.
        </p>
      </div>

      {/* Pending claims on the user's found items */}
      {pendingClaims.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
            Someone thinks they found your item
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pendingClaims.map((claim) => (
              <div
                key={claim.id}
                className="card"
                style={{ borderLeft: "4px solid var(--accent-2, #1E63D6)" }}
              >
                <p style={{ fontSize: 14 }}>
                  A user believes your found report{" "}
                  <strong>{claim.foundItem.title}</strong> matches their lost{" "}
                  <strong>{claim.lostItem.title}</strong>{" "}
                  <span style={{ color: "var(--text-muted)" }}>
                    ({claim.score}% match)
                  </span>
                  .
                </p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>
                  Their description: {claim.lostItem.description}
                </p>
                <div style={{ marginTop: 12 }}>
                  <MatchClaimActions matchId={claim.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          { label: "Your Found Reports", value: foundCount, color: "var(--accent-2)" },
          { label: "Total Lost Reports", value: totalLost, color: "var(--accent-3)" },
          { label: "Total Found Reports", value: totalFound, color: "var(--accent)" },
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
      <div style={{ display: "flex", gap: 12, marginBottom: 36, flexWrap: "wrap" }}>
        <Link href="/report-lost" className="btn btn-primary">
          + Report Lost Item
        </Link>
        <Link href="/report-found" className="btn btn-primary">
          + Report Found Item
        </Link>
        <Link href="/browse" className="btn btn-blue">
          Browse Lost Items
        </Link>
      </div>

      {/* Recent lost reports */}
      <div>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 16,
            letterSpacing: "-0.01em",
          }}
        >
          Your recent lost reports
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
                className="card report-card"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                    <span className={`tag tag-${item.transportMode.toLowerCase()}`}>
                      {item.transportMode}
                    </span>
                    · {item.location} · {new Date(item.dateTimeOfLoss).toLocaleDateString("en-SG")}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={`tag tag-${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                  <ShareButton itemId={item.id} itemTitle={item.title} />
                  <Link
                    href={`/items/${item.id}/matches`}
                    style={{ fontSize: 13, color: "var(--accent-2)", fontWeight: 500 }}
                  >
                    View Matches →
                  </Link>
                  <ItemActions
                    itemType="lost"
                    item={{
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      category: item.category,
                      transportMode: item.transportMode,
                      location: item.location,
                      contactEmail: item.contactEmail,
                      status: item.status,
                      dateTime: item.dateTimeOfLoss.toISOString(),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent found reports */}
      <div style={{ marginTop: 36 }}>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 16,
            letterSpacing: "-0.01em",
          }}
        >
          Your recent found reports
        </h2>
        {recentFoundItems.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px 24px" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              You haven&apos;t submitted any found item reports yet.
            </p>
            <Link href="/report-found" className="btn btn-primary" style={{ marginTop: 16 }}>
              Report a Found Item
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentFoundItems.map((item) => (
              <div
                key={item.id}
                className="card"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                    {item.transportMode} · {item.location} ·{" "}
                    {new Date(item.dateTimeFound).toLocaleDateString("en-SG")}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={`tag tag-${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                  <ShareButton itemId={item.id} itemTitle={item.title} />
                  <ItemActions
                    itemType="found"
                    item={{
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      category: item.category,
                      transportMode: item.transportMode,
                      location: item.location,
                      contactEmail: item.contactEmail,
                      status: item.status,
                      dateTime: item.dateTimeFound.toISOString(),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}