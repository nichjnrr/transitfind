// src/components/ItemActions.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const CATEGORIES = [
  "WALLET", "PHONE", "KEYS", "BAG", "CLOTHING",
  "ELECTRONICS", "DOCUMENTS", "JEWELLERY", "UMBRELLA", "OTHER",
];
const TRANSPORT_MODES = ["MRT", "BUS", "LRT", "INTERCHANGE"];

export interface EditableItem {
  id: string;
  title: string;
  description: string;
  category: string;
  transportMode: string;
  location: string;
  contactEmail: string;
  status: string;
  dateTime: string; // ISO string of dateTimeOfLoss or dateTimeFound
}

export default function ItemActions({
  item,
  itemType = "lost",
}: {
  item: EditableItem;
  itemType?: "lost" | "found";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const endpoint =
    itemType === "found" ? `/api/found-items/${item.id}` : `/api/items/${item.id}`;
  const dateField = itemType === "found" ? "dateTimeFound" : "dateTimeOfLoss";

  // Pre-fill the edit form. datetime-local needs "YYYY-MM-DDTHH:mm".
  const [form, setForm] = useState({
    title: item.title,
    description: item.description,
    category: item.category,
    transportMode: item.transportMode,
    location: item.location,
    contactEmail: item.contactEmail,
    dateTime: item.dateTime ? item.dateTime.slice(0, 16) : "",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  // Close the dropdown when clicking outside it.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const patch = async (payload: object, successMsg: string) => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Could not update");
        return false;
      }
      toast.success(successMsg);
      router.refresh();
      return true;
    } catch {
      toast.error("Something went wrong");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const markResolved = async () => {
    setMenuOpen(false);
    await patch({ status: "CLOSED" }, "Marked as resolved");
  };

  const saveEdit = async () => {
    if (form.description.trim().length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }
    const ok = await patch(
      { ...form, [dateField]: form.dateTime, dateTime: undefined },
      "Report updated"
    );
    if (ok) setEditOpen(false);
  };

  const deleteReport = async () => {
    setMenuOpen(false);
    if (!confirm("Delete this report? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Could not delete");
        return;
      }
      toast.success("Report deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const menuItem: React.CSSProperties = {
    display: "block",
    width: "100%",
    textAlign: "left",
    background: "none",
    border: "none",
    padding: "9px 14px",
    fontSize: 13,
    cursor: "pointer",
    color: "inherit",
  };

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      {/* Three-dots trigger */}
      <button
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Report actions"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 20,
          lineHeight: 1,
          color: "var(--text-muted)",
          padding: "2px 6px",
          borderRadius: 6,
        }}
      >
        ⋯
      </button>

      {/* Dropdown */}
      {menuOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 4px)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "0 6px 20px rgba(0,0,0,0.10)",
            minWidth: 150,
            zIndex: 20,
            overflow: "hidden",
          }}
        >
          <button style={menuItem} onClick={() => { setEditOpen(true); setMenuOpen(false); }}>
            Edit
          </button>
          {item.status !== "CLOSED" && (
            <button style={{ ...menuItem, color: "var(--accent-3)" }} onClick={markResolved} disabled={loading}>
              Mark resolved
            </button>
          )}
          <button style={{ ...menuItem, color: "var(--accent)" }} onClick={deleteReport} disabled={loading}>
            Delete
          </button>
        </div>
      )}

      {/* Edit modal */}
      {editOpen && (
        <div
          onClick={() => setEditOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}
          >
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Edit Report</h3>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows={3}
                maxLength={500}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={(e) => set("category", e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Transport Mode</label>
                <select className="form-input" value={form.transportMode} onChange={(e) => set("transportMode", e.target.value)}>
                  {TRANSPORT_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" value={form.location} onChange={(e) => set("location", e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Date &amp; Time</label>
              <input
                className="form-input"
                type="datetime-local"
                value={form.dateTime}
                onChange={(e) => set("dateTime", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input className="form-input" type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
              <button className="btn btn-secondary" onClick={() => setEditOpen(false)} disabled={loading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveEdit} disabled={loading}>
                {loading ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
