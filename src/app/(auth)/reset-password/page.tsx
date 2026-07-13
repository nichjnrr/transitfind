// src/app/(auth)/reset-password/page.tsx
"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not reset password");
        return;
      }
      toast.success("Password reset! You can now log in.");
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <p style={{ fontWeight: 600 }}>Invalid reset link</p>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 8 }}>
          This link is missing its token. Please request a new reset email.
        </p>
        <Link href="/forgot-password" className="btn btn-primary" style={{ marginTop: 16 }}>
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      {done ? (
        <div style={{ textAlign: "center" }}>
          <p style={{ fontWeight: 600 }}>Password updated</p>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 8 }}>
            Redirecting you to login…
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New password</label>
            <input
              className="form-input"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm new password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Re-enter your new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !password || !confirm}
            style={{ width: "100%" }}
          >
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </form>
      )}
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Link href="/login" style={{ fontSize: 13, color: "var(--accent-2)" }}>
          ← Back to login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ maxWidth: 400, margin: "0 auto", paddingTop: 40 }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Choose a new password</h1>
      </div>
      <Suspense fallback={<div className="card">Loading…</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
