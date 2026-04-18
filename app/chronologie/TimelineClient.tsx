"use client";

import { useState } from "react";

type Event = {
  id: number;
  year: number;
  displayDate: string;
  period: string;
  title: string;
  description: string;
};

type Period = { id: string; label: string };

const PERIODS: Period[] = [
  { id: "prehistoire", label: "Préhistoire" },
  { id: "ancien",      label: "Ancien Empire" },
  { id: "moyen",       label: "Moyen Empire" },
  { id: "nouvel",      label: "Nouvel Empire" },
  { id: "tardif",      label: "Basse Époque" },
  { id: "greco",       label: "Période gréco-romaine" },
  { id: "moderne",     label: "Égypte moderne" },
];

export default function TimelineClient({ events }: { events: Event[] }) {
  const [query, setQuery] = useState("");
  const [activePeriod, setActivePeriod] = useState("all");

  const filtered = events.filter((e) => {
    const matchesPeriod = activePeriod === "all" || e.period === activePeriod;
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.displayDate.toLowerCase().includes(q);
    return matchesPeriod && matchesQuery;
  });

  return (
    <>
      <div className="timeline-controls">
        <input
          type="search"
          placeholder="Rechercher un événement…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className={`chip${activePeriod === "all" ? " is-active" : ""}`}
          onClick={() => setActivePeriod("all")}
        >
          Tous
        </button>
        {PERIODS.map((p) => (
          <button
            key={p.id}
            className={`chip${activePeriod === p.id ? " is-active" : ""}`}
            onClick={() => setActivePeriod(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="timeline-empty">Aucun événement ne correspond à votre recherche.</p>
      ) : (
        <div className="timeline">
          {filtered.map((e) => (
            <div key={e.id} className="tl-event">
              <div className="tl-card">
                <span className="tl-date">{e.displayDate}</span>
                <div className="tl-title">{e.title}</div>
                <p className="tl-desc">{e.description}</p>
                <span className="tl-period">
                  {PERIODS.find((p) => p.id === e.period)?.label ?? e.period}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
