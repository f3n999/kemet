import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [eventCount, pharaohCount] = await Promise.all([
    prisma.timelineEvent.count(),
    prisma.pharaoh.count(),
  ]);

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="fade-up">
            <span className="eyebrow">Média indépendant • Histoire de l&apos;Égypte ancienne</span>
            <h1>
              Comprendre l&apos;Égypte,
              <span className="accent">pas la consommer.</span>
            </h1>
            <p className="lead">
              Kemet raconte cinquante siècles d&apos;histoire égyptienne comme un historien
              le ferait à un ami curieux&nbsp;: avec rigueur, avec angle, avec les sources.
              Sans jargon, sans raccourci, sans top 10 des mystères.
            </p>
            <div className="hero-cta">
              <Link href="/chronologie" className="btn btn-primary">Explorer la chronologie</Link>
              <Link href="/pharaons" className="btn">Voir les figures</Link>
            </div>
          </div>

          <aside className="hero-aside fade-up delay-2">
            <h3>Ce que vous allez trouver ici</h3>
            <p className="muted" style={{ fontSize: ".92rem" }}>
              Deux entrées, un seul fil&nbsp;: comprendre comment cette civilisation a pensé,
              bâti, régné et été redécouverte.
            </p>
            <div className="hero-stats">
              <div>
                <strong>{eventCount}</strong>
                <span>Événements historiques</span>
              </div>
              <div>
                <strong>{pharaohCount}</strong>
                <span>Figures — rois, reines</span>
              </div>
              <div>
                <strong>01</strong>
                <span>Chronologie interactive</span>
              </div>
              <div>
                <strong>50+</strong>
                <span>Siècles d&apos;histoire</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <div className="container"><div className="divider"><span>Trois portes d&apos;entrée</span></div></div>

      {/* PILIERS */}
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <header className="section-head">
            <span className="eyebrow">Par où commencer</span>
            <h2>Lire, situer, approfondir</h2>
            <p className="lead">
              Deux manières d&apos;entrer selon ce que vous cherchez&nbsp;: la frise qui situe,
              les portraits qui incarnent.
            </p>
          </header>

          <div className="grid-3">
            <article className="card">
              <span className="num">N° 01</span>
              <h3>La chronologie vivante</h3>
              <p>
                Une frise interactive filtrable par période et par mot-clé.
                L&apos;index transversal du site&nbsp;: chaque événement raconte
                une rupture, une construction, une disparition.
              </p>
              <Link className="read-more" href="/chronologie">Voir la chronologie</Link>
            </article>

            <article className="card">
              <span className="num">N° 02</span>
              <h3>Les figures</h3>
              <p>
                Pharaons, reines, architectes&nbsp;: les individus qui ont laissé une trace
                assez nette pour qu&apos;on puisse encore leur parler à travers le temps.
              </p>
              <Link className="read-more" href="/pharaons">Voir les portraits</Link>
            </article>

            <article className="card">
              <span className="num">N° 03</span>
              <h3>Contribuer</h3>
              <p>
                Une erreur, une source à signaler, une question sur l&apos;égyptologie&nbsp;?
                Kemet est un média indépendant qui vit par ses lecteurs.
              </p>
              <Link className="read-more" href="/contact">Nous écrire</Link>
            </article>
          </div>
        </div>
      </section>

      {/* CITATION */}
      <section>
        <div className="container" style={{ maxWidth: "820px", textAlign: "center" }}>
          <span className="eyebrow">Une terre, mille récits</span>
          <h2 style={{ fontStyle: "italic", lineHeight: 1.25 }}>
            «&nbsp;L&apos;Égypte est un don du Nil.&nbsp;»
          </h2>
          <p className="muted">— Hérodote, <em>Histoires</em>, livre II, vers 450 av. J.-C.</p>
          <p style={{ marginTop: "30px", maxWidth: "none" }}>
            Cette phrase est devenue un cliché parce qu&apos;elle est vraie. Sans la crue
            annuelle du Nil, pas d&apos;agriculture&nbsp;; sans agriculture, pas d&apos;État&nbsp;;
            sans État, pas de pyramides, pas d&apos;écriture, pas de trente dynasties. Tout
            le reste découle de ce fleuve. Comprendre l&apos;Égypte, c&apos;est d&apos;abord comprendre
            ça — et ensuite poser les bonnes questions sur ce qu&apos;on en a fait.
          </p>
        </div>
      </section>

      {/* PROMESSE ÉDITORIALE */}
      <section style={{ background: "var(--ink)", color: "var(--papyrus)" }}>
        <div className="container" style={{ maxWidth: "820px", textAlign: "center" }}>
          <span className="eyebrow" style={{ color: "var(--gold-bright)" }}>Ligne éditoriale</span>
          <h2 style={{ color: "var(--papyrus-light)" }}>Sources visibles. Angles assumés.</h2>
          <p className="lead" style={{ color: "var(--papyrus-deep)", margin: "0 auto 32px" }}>
            Chaque article publié sur Kemet cite ses sources en bas de page — BIFAO, ENiM,
            Grimal, Wilkinson, Vernus. Aucun contenu généré sans relecture humaine. Aucun
            article bâclé pour faire du trafic. Si ça ne parle pas à quelqu&apos;un qui a déjà
            lu un livre sur l&apos;Égypte, ça ne sort pas.
          </p>
          <Link href="/chronologie" className="btn btn-gold">Commencer par la chronologie</Link>
        </div>
      </section>
    </main>
  );
}
