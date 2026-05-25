// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh" }}>
      {/* Nav */}
      <nav
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontWeight: 700,
              fontSize: 18,
              color: "var(--accent)",
              letterSpacing: "-0.02em",
            }}
          >
            Transit<span style={{ color: "var(--accent-2)" }}>Find</span>
          </span>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/browse" className="btn btn-secondary">
              Browse Items
            </Link>
            <Link href="/login" className="btn btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          padding: "80px 0 60px",
          textAlign: "center",
          background:
            "linear-gradient(135deg, #fff1f0 0%, #e6f7ff 50%, #f6ffed 100%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "inline-block",
              background: "var(--accent)",
              color: "white",
              padding: "4px 14px",
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            Singapore Public Transport Lost & Found
          </div>
          <h1
            style={{
              fontSize: "clamp(32px, 6vw, 56px)",
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: 20,
              letterSpacing: "-0.03em",
            }}
          >
            Lost something on the MRT or bus?
            <br />
            <span style={{ color: "var(--accent-2)" }}>
              Find it here.
            </span>
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "var(--text-muted)",
              maxWidth: 560,
              margin: "0 auto 36px",
            }}
          >
            TransitFind is a single platform for reporting and recovering lost
            items across SBS, SMRT, Tower Transit, and Go-Ahead. No more
            calling four different operators.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/register" className="btn btn-primary" style={{ padding: "12px 28px", fontSize: 15 }}>
              Report a Lost Item
            </Link>
            <Link href="/browse" className="btn btn-secondary" style={{ padding: "12px 28px", fontSize: 15 }}>
              Browse Found Items
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "60px 0" }}>
        <div className="container">
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 40,
              textAlign: "center",
              letterSpacing: "-0.02em",
            }}
          >
            How TransitFind works
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                step: "01",
                color: "var(--accent)",
                title: "Create an account",
                desc: "Sign up for free in under a minute.",
              },
              {
                step: "02",
                color: "var(--accent-2)",
                title: "Submit a report",
                desc: "Describe your lost item, route taken, and time of loss.",
              },
              {
                step: "03",
                color: "var(--accent-3)",
                title: "Get matched",
                desc: "Our system matches your report against found item submissions.",
              },
              {
                step: "04",
                color: "#722ed1",
                title: "Recover your item",
                desc: "Contact the finder and arrange collection.",
              },
            ].map(({ step, color, title, desc }) => (
              <div key={step} className="card">
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 28,
                    fontWeight: 700,
                    color,
                    marginBottom: 12,
                    opacity: 0.85,
                  }}
                >
                  {step}
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-muted)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "24px 0",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: 13,
        }}
      >
        <div className="container">
          Built for Orbital 26 · NUS School of Computing
        </div>
      </footer>
    </main>
  );
}
