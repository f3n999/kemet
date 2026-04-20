"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/actions";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await loginUser(formData);
      if (!result.ok) {
        setError(result.error ?? "Erreur inconnue.");
      } else {
        router.push(result.role === "ADMIN" ? "/admin" : "/");
        router.refresh();
      }
    });
  }

  return (
    <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px var(--gutter)" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span style={{ fontFamily: "var(--serif-display)", fontSize: "2rem", color: "var(--gold)" }}>𓋹</span>
          <h1 style={{ fontFamily: "var(--serif-display)", fontSize: "1.6rem", marginTop: "12px" }}>Connexion</h1>
          <p style={{ color: "var(--ink-soft)", marginTop: "8px", fontSize: "0.95rem" }}>
            Accédez à votre espace Kemet
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: "var(--papyrus-light)", border: "1px solid var(--line)", borderRadius: "4px", padding: "36px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "var(--shadow-soft)" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="votre@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p style={{ color: "var(--terracotta)", fontSize: "0.9rem", background: "rgba(166,75,42,.08)", padding: "10px 14px", borderRadius: "2px", borderLeft: "3px solid var(--terracotta)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={isPending}
            style={{ width: "100%", justifyContent: "center", opacity: isPending ? 0.7 : 1 }}
          >
            {isPending ? "Connexion…" : "Se connecter"}
          </button>

          <p style={{ textAlign: "center", fontSize: "0.9rem", color: "var(--ink-soft)" }}>
            Pas encore de compte ?{" "}
            <Link href="/register" style={{ color: "var(--lapis)", fontWeight: 500 }}>
              Créer un compte
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
