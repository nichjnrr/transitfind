// src/app/(admin)/admin/layout.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Enforced on the server: only admins get in. Everyone else is redirected.
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            className="tag tag-matched"
            style={{ fontWeight: 700, letterSpacing: "0.04em" }}
          >
            ADMIN
          </span>
          <span style={{ fontWeight: 700, fontSize: 18 }}>TransitFind Admin</span>
        </div>
        <Link href="/dashboard" style={{ fontSize: 14, color: "var(--accent-2)" }}>
          ← Back to app
        </Link>
      </div>
      {children}
    </div>
  );
}
