// src/app/(dashboard)/layout.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 64px)", padding: "32px 0" }}>
        <div className="container">{children}</div>
      </main>
    </>
  );
}
