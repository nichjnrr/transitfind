// src/app/(dashboard)/report-found/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const CATEGORIES = [
  "WALLET", "PHONE", "KEYS", "BAG", "CLOTHING",
  "ELECTRONICS", "DOCUMENTS", "JEWELLERY", "UMBRELLA", "OTHER",
];

const TRANSPORT_MODES = ["MRT", "BUS", "LRT", "INTERCHANGE"];

export default function ReportFoundPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    transportMode: "",
    location: "",
    dateTimeFound: "",
    contactEmail: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const foundDate = new Date(form.dateTimeFound);
    if (foundDate > new Date()) {
      toast.error("Date found cannot be in the future");
      setLoading(false);
      return;
    }
    if (form.description.trim().length < 10) {
      toast.error("Description must be at least 10 characters");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/found-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          title: form.title.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Submission failed");
        return;
      }
      toast.success("Found item report submitted!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Report a Found Item
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 6, fontSize: 14 }}>
          Help reunite someone with their lost belongings.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Item Title *</label>
            <input
              className="form-input"
              placeholder="e.g. Blue umbrella"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-input"
              placeholder="Describe the item in detail — colour, brand, markings, contents, etc."
              rows={4}
              value={form.description}
              onChange={(e) => {
                set("description", e.target.value);
                setCharCount(e.target.value.length);
              }}
              required
              maxLength={500}
              style={{ resize: "vertical" }}
            />
            <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "right", marginTop: 4 }}>
              {charCount} / 500 characters
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-input"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                required
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0) + c.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Transport Mode *</label>
              <select
                className="form-input"
                value={form.transportMode}
                onChange={(e) => set("transportMode", e.target.value)}
                required
              >
                <option value="">Select mode</option>
                {TRANSPORT_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location / Station / Route *</label>
            <input
              className="form-input"
              placeholder="e.g. EW02 Tampines MRT, or Bus 65"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date & Time Found *</label>
            <input
              className="form-input"
              type="datetime-local"
              value={form.dateTimeFound}
              onChange={(e) => set("dateTimeFound", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Email *</label>
            <input
              className="form-input"
              type="email"
              placeholder="So the owner can reach you"
              value={form.contactEmail}
              onChange={(e) => set("contactEmail", e.target.value)}
              required
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "flex-end",
              marginTop: 8,
              paddingTop: 16,
              borderTop: "1px solid var(--border)",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setForm({
                  title: "",
                  description: "",
                  category: "",
                  transportMode: "",
                  location: "",
                  dateTimeFound: "",
                  contactEmail: "",
                });
                setCharCount(0);
              }}
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !form.title || !form.description || !form.category || !form.transportMode || !form.location || !form.dateTimeFound || !form.contactEmail}
            >
              {loading ? "Submitting…" : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
