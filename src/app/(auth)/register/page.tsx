// src/app/(auth)/register/page.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }
      // Auto sign in after registration
      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (signInResult?.error) {
        toast.success("Account created! Please sign in.");
        router.push("/login");
      } else {
        toast.success("Welcome to TransitFind!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/">
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
                fontSize: 22,
                color: "var(--accent)",
              }}
            >
              Transit<span style={{ color: "var(--accent-2)" }}>Find</span>
            </span>
          </Link>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginTop: 20,
              letterSpacing: "-0.02em",
            }}
          >
            Create your account
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: 6, fontSize: 14 }}>
            Already have one?{" "}
            <Link href="/login" style={{ color: "var(--accent-2)", fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
