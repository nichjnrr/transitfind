// src/app/(auth)/forgot-password/page.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      toast.success(data.message || "Check your email.");
      setSent(true);
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", paddingTop: 40 }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Reset your password</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <div className="card">
        {sent ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 600 }}>Check your inbox</p>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 8 }}>
              If that email has an account, a reset link is on its way. The link
              expires in one hour.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !email}
              style={{ width: "100%" }}
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Link href="/login" style={{ fontSize: 13, color: "var(--accent-2)" }}>
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
