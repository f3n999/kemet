# Supabase Backend — Setup Guide

## Étape 1 : Créer le projet Supabase

1. Va sur https://supabase.com → New project
2. Nom : `kemet` | Région : West EU (Frankfurt) recommandé
3. Note bien le **Project URL** et l'**anon public key** (Settings → API)
4. Colle-les dans `assets/js/kemet-config.js`

## Étape 2 : Créer les tables

Copie-colle le SQL ci-dessous dans Supabase → **SQL Editor** → Run.

```sql
-- ====================================================
-- KEMET — Schéma Supabase
-- ====================================================

-- 1. Profils utilisateurs (extension de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger : créer un profil automatiquement à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Prix des ebooks (modifiable par l'admin)
CREATE TABLE IF NOT EXISTS public.ebook_prices (
  slug        TEXT PRIMARY KEY,
  price       DECIMAL(10,2) NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Prix par défaut
INSERT INTO public.ebook_prices (slug, price) VALUES
  ('akhenaton-pharaon-heretique',   0.00),
  ('pyramides-science',             7.99),
  ('nefertiti-enquete',             6.99),
  ('hatchepsout-regne-efface',      7.99),
  ('ramses-propagande',             8.99),
  ('momification-manuel',           6.99),
  ('toutankhamon-tresor',           5.99),
  ('hieroglyphes-initiation',       0.00),
  ('voyager-egypte-guide',          9.99),
  ('cleopatre-derniere-pharaone',   7.99)
ON CONFLICT (slug) DO NOTHING;

-- 3. Achats / accès utilisateurs
CREATE TABLE IF NOT EXISTS public.user_purchases (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ebook_slug   TEXT NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ebook_slug)
);

-- ====================================================
-- ROW LEVEL SECURITY
-- ====================================================

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebook_prices   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- profiles : chacun voit/édite son propre profil ; admin voit tout
CREATE POLICY "Profil visible par son propriétaire" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Profil modifiable par son propriétaire" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- profiles admin : lecture totale (pour le back-office)
CREATE POLICY "Admin voit tous les profils" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ebook_prices : lecture publique, écriture admin uniquement
CREATE POLICY "Prix lisibles par tous" ON public.ebook_prices
  FOR SELECT USING (true);

CREATE POLICY "Prix modifiables par admin" ON public.ebook_prices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- user_purchases : chacun voit ses achats ; admin voit tout
CREATE POLICY "Achats visibles par leur propriétaire" ON public.user_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin voit tous les achats" ON public.user_purchases
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin peut accorder/retirer des accès" ON public.user_purchases
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Insertion propre pour les achats" ON public.user_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Étape 3 : Créer le compte admin

Dans Supabase → Authentication → Users → Add user :
- Email : `admin@kemet.fr`
- Password : (choisis un mot de passe fort)
- Coche "Auto Confirm User"

Puis dans SQL Editor :
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@kemet.fr');
```

## Étape 4 : Configurer le site

Modifie `assets/js/kemet-config.js` avec tes credentials Supabase.

## Résumé des tables

| Table | Usage |
|---|---|
| `auth.users` | Gérée par Supabase (email, password) |
| `profiles` | Nom + rôle (user/admin) |
| `ebook_prices` | Prix modifiables par l'admin |
| `user_purchases` | Quel user a accès à quel ebook |
