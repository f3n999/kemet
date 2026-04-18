import { prisma } from "@/lib/db";
import TimelineClient from "./TimelineClient";

export const dynamic = "force-dynamic";

export default async function ChronologiePage() {
  const events = await prisma.timelineEvent.findMany({
    orderBy: { year: "asc" },
  });

  return (
    <main>
      <section className="hero" style={{ paddingBottom: "50px" }}>
        <div className="container" style={{ maxWidth: "820px" }}>
          <span className="eyebrow">Chronologie</span>
          <h1>
            Cinquante siècles
            <span className="accent">d&apos;histoire en un coup d&apos;œil</span>
          </h1>
          <p className="lead">
            Filtrez par période ou par mot-clé pour naviguer dans l&apos;histoire
            de l&apos;Égypte ancienne — de la Préhistoire nilotique à la conquête romaine.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <TimelineClient events={events} />
        </div>
      </section>
    </main>
  );
}
