"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/report-lost", label: "Report Lost" },
    { href: "/browse", label: "Browse Lost" },
  ];

  return (
    <nav style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", position: "sticky", top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <Link href="/">
          <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 18, color: "var(--accent)", letterSpacing: "-0.02em" }}>
            Transit<span style={{ color: "var(--accent-2)" }}>Find</span>
          </span>
        </Link>

        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                color: pathname === href ? "var(--accent-2)" : "var(--text-muted)",
                background: pathname === href ? (theme === "dark" ? "#003a8c" : "#e6f7ff") : "transparent",
                transition: "all 0.15s",
              }}
            >
              {label}
            </Link>
          ))}

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle dark mode"
            style={{
              background: "transparent",
              border: "1.5px solid var(--border)",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 16,
              color: "var(--text-muted)",
              marginLeft: 4,
            }}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {session ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 8 }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
                {session.user?.name?.split(" ")[0]}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn btn-secondary"
                style={{ padding: "6px 14px", fontSize: 13 }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary" style={{ marginLeft: 8, fontSize: 13 }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}