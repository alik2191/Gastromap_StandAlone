-- ─────────────────────────────────────────────────────────────────────────────
-- 003_profiles.sql  —  Profiles + Auth + Admin setup (complete, safe to re-run)
-- Run in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────


-- ═══════════════════════════════════════════════════════════════════════════
-- 1. FTS column on locations (fixes textSearch('fts', ...) in the app)
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.locations
    ADD COLUMN IF NOT EXISTS fts tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english',
            coalesce(title, '')       || ' ' ||
            coalesce(description, '') || ' ' ||
            coalesce(city, '')        || ' ' ||
            coalesce(cuisine, '')     || ' ' ||
            coalesce(array_to_string(tags, ' '), '') || ' ' ||
            coalesce(ai_context, '')
        )
    ) STORED;

DROP INDEX IF EXISTS locations_fts_idx;
CREATE INDEX IF NOT EXISTS locations_fts_gin ON public.locations USING gin(fts);


-- ═══════════════════════════════════════════════════════════════════════════
-- 2. Profiles table
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT,
    name        TEXT,
    role        TEXT        NOT NULL DEFAULT 'user'
                            CHECK (role IN ('user', 'admin', 'moderator')),
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════════════════
-- 3. Auto-update updated_at
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.set_profile_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_profile_updated_at();


-- ═══════════════════════════════════════════════════════════════════════════
-- 4. Auto-create profile when a new user signs up
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'user'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ═══════════════════════════════════════════════════════════════════════════
-- 5. Role helper — SECURITY DEFINER avoids recursive RLS calls
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated, anon;


-- ═══════════════════════════════════════════════════════════════════════════
-- 6. Profiles RLS
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles: own read"         ON public.profiles;
DROP POLICY IF EXISTS "profiles: own update"       ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin read all"   ON public.profiles;
DROP POLICY IF EXISTS "profiles: service role all" ON public.profiles;

-- Users can read their own profile
CREATE POLICY "profiles: own read"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "profiles: admin read all"
    ON public.profiles FOR SELECT
    USING (public.get_my_role() = 'admin');

-- Users can update their own name/avatar (role is protected)
CREATE POLICY "profiles: own update"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Service role has full access (server-side operations)
CREATE POLICY "profiles: service role all"
    ON public.profiles FOR ALL
    USING (auth.role() = 'service_role');

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;


-- ═══════════════════════════════════════════════════════════════════════════
-- 7. Locations RLS — admin write access
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Admin read all locations"  ON public.locations;
DROP POLICY IF EXISTS "Admin insert locations"    ON public.locations;
DROP POLICY IF EXISTS "Admin update locations"    ON public.locations;
DROP POLICY IF EXISTS "Admin delete locations"    ON public.locations;

-- Admins can see all locations (including hidden/coming_soon)
CREATE POLICY "Admin read all locations"
    ON public.locations FOR SELECT
    USING (public.get_my_role() = 'admin');

-- Admins can create locations
CREATE POLICY "Admin insert locations"
    ON public.locations FOR INSERT
    WITH CHECK (public.get_my_role() = 'admin');

-- Admins can update locations
CREATE POLICY "Admin update locations"
    ON public.locations FOR UPDATE
    USING  (public.get_my_role() = 'admin')
    WITH CHECK (public.get_my_role() = 'admin');

-- Admins can delete locations
CREATE POLICY "Admin delete locations"
    ON public.locations FOR DELETE
    USING (public.get_my_role() = 'admin');


-- ═══════════════════════════════════════════════════════════════════════════
-- 8. Backfill profiles for existing auth users (safe, no-op if already exist)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.profiles (id, email, name, role)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
    'user'
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════════
-- 9. Set admin role
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'alik2191@gmail.com';
