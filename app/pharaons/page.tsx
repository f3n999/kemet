import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PharaonsPage() {
  const pharaohs = await prisma.pharaoh.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <main>
      <section className="hero" style={{ paddingBottom: "50px" }}>
        <div className="container" style={{ maxWidth: "820px" }}>
          <span className="eyebrow">Figures</span>
          <h1>
            Pharaons
            <span className="accent">visages d&apos;une civilisation</span>
          </h1>
          <p className="lead">
            Neuf figures, trois millénaires, neuf manières d&apos;incarner ce pouvoir
            qui se voulait à la fois humain et divin.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          {pharaohs.length === 0 ? (
            <p className="timeline-empty">Aucune figure disponible pour l&apos;instant.</p>
          ) : (
            <div className="grid-3">
              {pharaohs.map((p) => (
                <article key={p.id} className="card">
                  <span className="num">{p.date}</span>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: "14px",
                      fontFamily: "var(--serif-display)",
                      fontSize: ".68rem",
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      color: "var(--lapis)",
                      border: "1px solid var(--lapis)",
                      padding: "2px 8px",
                    }}
                  >
                    {p.dynasty}
                  </span>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
