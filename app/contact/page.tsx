"use client";

import { useState, useTransition } from "react";
import { submitContact } from "@/lib/actions";

export default function ContactPage() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      const result = await submitContact(formData);
      if (result.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    });
  }

  return (
    <main>
      <section className="hero" style={{ paddingBottom: "50px" }}>
        <div className="container" style={{ maxWidth: "820px" }}>
          <span className="eyebrow">Contact</span>
          <h1>
            Écrire
            <span className="accent">à la rédaction</span>
          </h1>
          <p className="lead">
            Question, correction, suggestion de source ou envie de contribuer&nbsp;:
            toutes les demandes sont lues.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="form-grid">
            <form className="form" onSubmit={handleSubmit}>
              <div className="row">
                <div>
                  <label htmlFor="name">Prénom &amp; Nom</label>
                  <input id="name" name="name" type="text" required />
                </div>
                <div>
                  <label htmlFor="email">Adresse e-mail</label>
                  <input id="email" name="email" type="email" required />
                </div>
              </div>

              <label htmlFor="subject">Sujet</label>
              <input id="subject" name="subject" type="text" />

              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" required />

              <button
                type="submit"
                className="btn btn-primary"
                style={{ marginTop: "24px", width: "100%", justifyContent: "center" }}
                disabled={isPending}
              >
                {isPending ? "Envoi…" : "Envoyer le message"}
              </button>

              {status === "success" && (
                <div className="form-status success">
                  Message envoyé. Nous vous répondrons dans les meilleurs délais.
                </div>
              )}
              {status === "error" && (
                <div className="form-status error">
                  Une erreur est survenue. Veuillez réessayer.
                </div>
              )}
            </form>

            <aside className="form-side">
              <ul>
                <li>
                  <strong>Corrections</strong>
                  Signalez une erreur factuelle, une source manquante ou une imprécision.
                </li>
                <li>
                  <strong>Contributions</strong>
                  Vous êtes chercheur, égyptologue ou passionné éclairé&nbsp;? Discutons.
                </li>
                <li>
                  <strong>Questions</strong>
                  Pas de question trop simple. L&apos;égyptologie s&apos;apprend par couches.
                </li>
                <li>
                  <strong>Réponse</strong>
                  Délai habituel&nbsp;: 2 à 5 jours ouvrés.
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
