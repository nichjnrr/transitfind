// src/app/(dashboard)/items/[id]/matches/page.tsx

export default async function MatchesPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // Load the lost item being matched.
  const lostItem = await prisma.lostItem.findUnique({ where: { id } });
  if (!lostItem) notFound();

  // Candidate found items: all open found items, newest first.
  const foundItems = await prisma.foundItem.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
  });

  const matches = findMatches(lostItem, foundItems);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <Link
        href="/dashboard"
        style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none" }}
      >
        ← Back to dashboard
      </Link>

      <div style={{ margin: "16px 0 28px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Potential Matches
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 6, fontSize: 14 }}>
          Found items that may match your lost <strong>{lostItem.title}</strong>.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 24px" }}>
          <p style={{ fontWeight: 600 }}>No matches yet</p>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
            We&apos;ll keep checking as new found items are reported. Try again later.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {matches.map(({ foundItem, percentage, reasons }) => (
            <div key={foundItem.id} className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 16 }}>{foundItem.title}</h3>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    <span className={`tag tag-${foundItem.transportMode.toLowerCase()}`}>
                      {foundItem.transportMode}
                    </span>
                    <span className={`tag tag-${foundItem.status.toLowerCase()}`}>
                      {foundItem.status}
                    </span>
                  </div>
                </div>
                <span
                  className="tag tag-matched"
                  style={{ whiteSpace: "nowrap", fontWeight: 700 }}
                >
                  {percentage}% match
                </span>
              </div>

              <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 12 }}>
                {foundItem.description}
              </p>

              <p style={{ fontSize: 13, marginTop: 10 }}>
                <strong>Found at:</strong> {foundItem.location}
              </p>

              {reasons.length > 0 && (
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>
                  Why this matched: {reasons.join(" · ")}
                </p>
              )}

              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                <a href={`mailto:${foundItem.contactEmail}`} className="btn btn-primary">
                  Contact finder
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
