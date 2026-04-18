import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kemet — Le média de l'Égypte ancienne",
  description:
    "Kemet raconte l'Égypte ancienne avec rigueur et sans jargon : figures, lieux, objets, controverses, techniques.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <header className="site-header">
          <nav className="container nav" aria-label="Navigation principale">
            <Link href="/" className="brand">
              <span className="brand-mark">𓋹</span>
              KEMET
            </Link>
            <ul className="nav-links">
              <li><Link href="/">Accueil</Link></li>
              <li><Link href="/chronologie">Chronologie</Link></li>
              <li><Link href="/pharaons">Figures</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </nav>
        </header>

        {children}

        <footer className="site-footer">
          <div className="container">
            <div className="footer-grid">
              <div>
                <div className="brand" style={{ color: "var(--gold-bright)" }}>
                  <span className="brand-mark" style={{ borderColor: "var(--gold-bright)", color: "var(--gold-bright)" }}>𓋹</span>
                  KEMET
                </div>
                <p style={{ marginTop: "18px" }}>
                  Le média de niche sur l&apos;Égypte ancienne, pour lecteurs qui en savent
                  déjà un peu et qui en veulent plus.
                </p>
              </div>
              <div>
                <h4>Lire</h4>
                <ul>
                  <li><Link href="/chronologie">Chronologie</Link></li>
                  <li><Link href="/pharaons">Figures</Link></li>
                </ul>
              </div>
              <div>
                <h4>Le projet</h4>
                <ul>
                  <li><Link href="/contact">Contact</Link></li>
                  <li><Link href="/contact">Contribuer</Link></li>
                </ul>
              </div>
              <div>
                <h4>Légal</h4>
                <ul>
                  <li><Link href="#">Mentions légales</Link></li>
                  <li><Link href="#">Confidentialité</Link></li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <span>© 2026 Kemet. Tous droits réservés.</span>
              <span>Média indépendant. Sources citées à chaque article.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
