// src/app/(dashboard)/browse/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ItemCategory, TransportMode } from "@prisma/client";
import PhotoGallery from "@/components/PhotoGallery";

interface Props {
  searchParams: {
    category?: string;
    transportMode?: string;
    keyword?: string;
  };
}

export default async function BrowsePage({ searchParams }: Props) {
  const { category, transportMode, keyword } = searchParams;

  const items = await prisma.lostItem.findMany({
    where: {
      ...(category && { category: category as ItemCategory }),
      ...(transportMode && { transportMode: transportMode as TransportMode }),
      ...(keyword && {
        OR: [
          { title: { contains: keyword, mode: "insensitive" } },
          { description: { contains: keyword, mode: "insensitive" } },
          { location: { contains: keyword, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  const CATEGORIES = [
    "WALLET", "PHONE", "KEYS", "BAG", "CLOTHING",
    "ELECTRONICS", "DOCUMENTS", "JEWELLERY", "UMBRELLA", "OTHER",
  ];
  const MODES = ["MRT", "BUS", "LRT", "INTERCHANGE"];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Browse Lost Items
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 6, fontSize: 14 }}>
          {items.length} report{items.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Filters — server-side via URL params */}
      <form
        method="GET"
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 28,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          className="form-input"
          name="keyword"
          placeholder="Search items…"
          defaultValue={keyword}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          className="form-input"
          name="category"
          defaultValue={category || ""}
          style={{ minWidth: 150 }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0) + c.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <select
          className="form-input"
          name="transportMode"
          defaultValue={transportMode || ""}
          style={{ minWidth: 150 }}
        >
          <option value="">All Modes</option>
          {MODES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-blue">
          Search
        </button>
        {(keyword || category || transportMode) && (
          <Link href="/browse" className="btn btn-secondary">
            Clear
          </Link>
        )}
      </form>

      {/* Results */}
      {items.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <p style={{ color: "var(--text-muted)" }}>No items match your search.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {items.map((item) => (
            <div key={item.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, flex: 1 }}>{item.title}</h3>
                <span
                  className={`tag tag-${item.transportMode.toLowerCase()}`}
                  style={{ marginLeft: 8, whiteSpace: "nowrap" }}
                >
                  {item.transportMode}
                </span>
              </div>

              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-muted)",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {item.description}
              </p>

              <PhotoGallery urls={item.imageUrls} />

              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                📍 {item.location}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                🕐 {new Date(item.dateTimeOfLoss).toLocaleString("en-SG", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
              <div
                style={{
                  paddingTop: 10,
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Reported by {item.user.name}
                </span>
                <span className={`tag tag-${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
