"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUser, deleteUser, deleteMessage } from "@/lib/actions";
import type { SessionPayload } from "@/lib/auth";

type User = { id: number; name: string; email: string; role: string; createdAt: Date };
type Message = { id: number; name: string; email: string; subject: string | null; message: string; createdAt: Date };

interface Props {
  session: SessionPayload;
  users: User[];
  messages: Message[];
  eventCount: number;
  pharaohCount: number;
}

export default function AdminClient({ session, users, messages, eventCount, pharaohCount }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<"users" | "messages">("users");

  function handleLogout() {
    startTransition(() => logoutUser());
  }

  function handleDeleteUser(userId: number, userName: string) {
    if (!confirm(`Supprimer l'utilisateur "${userName}" ?`)) return;
    startTransition(async () => {
      await deleteUser(userId);
      router.refresh();
    });
  }

  function handleDeleteMessage(messageId: number) {
    if (!confirm("Supprimer ce message ?")) return;
    startTransition(async () => {
      await deleteMessage(messageId);
      router.refresh();
    });
  }

  const statStyle: React.CSSProperties = {
    background: "var(--papyrus-light)",
    border: "1px solid var(--line)",
    borderRadius: "4px",
    padding: "24px 28px",
    textAlign: "center",
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "10px 24px",
    fontFamily: "var(--serif-display)",
    fontSize: "0.85rem",
    letterSpacing: ".06em",
    background: active ? "var(--lapis)" : "transparent",
    color: active ? "#fff" : "var(--ink-soft)",
    border: "1px solid",
    borderColor: active ? "var(--lapis)" : "var(--line)",
    cursor: "pointer",
    borderRadius: "2px",
    transition: "all .2s",
  });

  return (
    <main style={{ padding: "60px var(--gutter)", maxWidth: "var(--maxw)", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--serif-display)", fontSize: "clamp(1.6rem,3vw,2.2rem)" }}>
            Tableau de bord
          </h1>
          <p style={{ color: "var(--ink-soft)", marginTop: "6px" }}>
            Connecté en tant que <strong>{session.name}</strong> — rôle{" "}
            <span style={{ background: "var(--lapis)", color: "#fff", fontSize: "0.75rem", padding: "2px 8px", borderRadius: "2px", fontFamily: "var(--serif-display)", letterSpacing: ".06em" }}>
              {session.role}
            </span>
          </p>
        </div>
        <button onClick={handleLogout} disabled={isPending} style={{ background: "transparent", border: "1px solid var(--terracotta)", color: "var(--terracotta)", padding: "10px 20px", fontFamily: "var(--serif-display)", fontSize: "0.82rem", letterSpacing: ".06em", cursor: "pointer", borderRadius: "2px" }}>
          Déconnexion
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "48px" }}>
        <div style={statStyle}>
          <div style={{ fontFamily: "var(--serif-display)", fontSize: "2.4rem", color: "var(--gold)" }}>{users.length}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginTop: "4px" }}>Utilisateurs</div>
        </div>
        <div style={statStyle}>
          <div style={{ fontFamily: "var(--serif-display)", fontSize: "2.4rem", color: "var(--gold)" }}>{messages.length}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginTop: "4px" }}>Messages</div>
        </div>
        <div style={statStyle}>
          <div style={{ fontFamily: "var(--serif-display)", fontSize: "2.4rem", color: "var(--gold)" }}>{eventCount}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginTop: "4px" }}>Événements</div>
        </div>
        <div style={statStyle}>
          <div style={{ fontFamily: "var(--serif-display)", fontSize: "2.4rem", color: "var(--gold)" }}>{pharaohCount}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginTop: "4px" }}>Pharaons</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <button style={tabStyle(tab === "users")} onClick={() => setTab("users")}>Utilisateurs</button>
        <button style={tabStyle(tab === "messages")} onClick={() => setTab("messages")}>Messages reçus</button>
      </div>

      {/* Users table */}
      {tab === "users" && (
        <div style={{ background: "var(--papyrus-light)", border: "1px solid var(--line)", borderRadius: "4px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "var(--papyrus-deep)", borderBottom: "2px solid var(--line)" }}>
                <th style={{ padding: "14px 20px", textAlign: "left", fontFamily: "var(--serif-display)", fontSize: "0.8rem", letterSpacing: ".05em" }}>Nom</th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontFamily: "var(--serif-display)", fontSize: "0.8rem", letterSpacing: ".05em" }}>Email</th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontFamily: "var(--serif-display)", fontSize: "0.8rem", letterSpacing: ".05em" }}>Rôle</th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontFamily: "var(--serif-display)", fontSize: "0.8rem", letterSpacing: ".05em" }}>Inscrit le</th>
                <th style={{ padding: "14px 20px", textAlign: "right", fontFamily: "var(--serif-display)", fontSize: "0.8rem", letterSpacing: ".05em" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 500 }}>{u.name}</td>
                  <td style={{ padding: "14px 20px", color: "var(--ink-soft)" }}>{u.email}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      fontSize: "0.75rem",
                      padding: "2px 8px",
                      borderRadius: "2px",
                      fontFamily: "var(--serif-display)",
                      letterSpacing: ".05em",
                      background: u.role === "ADMIN" ? "var(--lapis)" : "var(--papyrus-deep)",
                      color: u.role === "ADMIN" ? "#fff" : "var(--ink-soft)",
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--ink-soft)", fontSize: "0.85rem" }}>
                    {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    {u.id !== session.id && (
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        disabled={isPending}
                        style={{ background: "transparent", border: "1px solid var(--terracotta)", color: "var(--terracotta)", padding: "5px 12px", fontSize: "0.8rem", cursor: "pointer", borderRadius: "2px" }}
                      >
                        Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Messages table */}
      {tab === "messages" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.length === 0 && (
            <p style={{ color: "var(--ink-soft)", padding: "40px", textAlign: "center" }}>Aucun message reçu.</p>
          )}
          {messages.map((m) => (
            <div key={m.id} style={{ background: "var(--papyrus-light)", border: "1px solid var(--line)", borderRadius: "4px", padding: "24px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                <div>
                  <strong style={{ fontFamily: "var(--serif-display)", fontSize: "0.95rem" }}>{m.name}</strong>
                  <span style={{ color: "var(--ink-soft)", fontSize: "0.85rem", marginLeft: "12px" }}>{m.email}</span>
                  {m.subject && <span style={{ marginLeft: "12px", fontSize: "0.85rem", color: "var(--gold)" }}>— {m.subject}</span>}
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }}>
                    {new Date(m.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => handleDeleteMessage(m.id)}
                    disabled={isPending}
                    style={{ background: "transparent", border: "1px solid var(--terracotta)", color: "var(--terracotta)", padding: "4px 10px", fontSize: "0.8rem", cursor: "pointer", borderRadius: "2px" }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              <p style={{ marginTop: "12px", lineHeight: 1.6, color: "var(--ink-soft)", fontSize: "0.9rem" }}>{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
