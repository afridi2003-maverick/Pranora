-- Migration: ADP-10 Smart Adoption Matching
-- Creates adopter_preferences table and get_adoption_matches() RPC
-- Timestamp: 20261127000000

-- ── adopter_preferences ──────────────────────────────────────────────────────
-- Stores a user's pet preferences for the smart matching algorithm.

CREATE TABLE IF NOT EXISTS public.adopter_preferences (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  species         text CHECK (species IN ('dog','cat','bird','rabbit','other','any')) DEFAULT 'any',
  preferred_gender text CHECK (preferred_gender IN ('male','female','unknown','any')) DEFAULT 'any',
  age_group       text CHECK (age_group IN ('baby','young','adult','senior','any')) DEFAULT 'any',
  district_id     integer REFERENCES public.districts(id) ON DELETE SET NULL,
  wants_vaccinated    boolean DEFAULT false,
  wants_neutered      boolean DEFAULT false,
  has_other_pets      boolean DEFAULT false,
  home_type           text CHECK (home_type IN ('own_house','rented_house','own_flat','rented_flat','other')) DEFAULT 'own_flat',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- ── adoption_match_logs ───────────────────────────────────────────────────────
-- Tracks which matches were surfaced to which user (for analytics / dedup).

CREATE TABLE IF NOT EXISTS public.adoption_match_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id  uuid NOT NULL REFERENCES public.adoption_listings(id) ON DELETE CASCADE,
  score       integer NOT NULL CHECK (score BETWEEN 0 AND 100),
  surfaced_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_adopter_prefs_user ON public.adopter_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_match_logs_user ON public.adoption_match_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_match_logs_listing ON public.adoption_match_logs(listing_id);

-- ── Updated-at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_adopter_prefs_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_adopter_prefs_updated_at ON public.adopter_preferences;
CREATE TRIGGER trg_adopter_prefs_updated_at
  BEFORE UPDATE ON public.adopter_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_adopter_prefs_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE public.adopter_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adoption_match_logs ENABLE ROW LEVEL SECURITY;

-- adopter_preferences: users manage their own row
CREATE POLICY "adopter_prefs_own"
  ON public.adopter_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- adoption_match_logs: users read their own rows; inserts done via RPC
CREATE POLICY "match_logs_read_own"
  ON public.adoption_match_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ── upsert_adopter_preferences(prefs jsonb) RPC ───────────────────────────────
CREATE OR REPLACE FUNCTION public.upsert_adopter_preferences(
  p_user_id           uuid,
  p_species           text DEFAULT 'any',
  p_preferred_gender  text DEFAULT 'any',
  p_age_group         text DEFAULT 'any',
  p_district_id       integer DEFAULT NULL,
  p_wants_vaccinated  boolean DEFAULT false,
  p_wants_neutered    boolean DEFAULT false,
  p_has_other_pets    boolean DEFAULT false,
  p_home_type         text DEFAULT 'own_flat'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.adopter_preferences (
    user_id, species, preferred_gender, age_group,
    district_id, wants_vaccinated, wants_neutered,
    has_other_pets, home_type
  ) VALUES (
    p_user_id, p_species, p_preferred_gender, p_age_group,
    p_district_id, p_wants_vaccinated, p_wants_neutered,
    p_has_other_pets, p_home_type
  )
  ON CONFLICT (user_id) DO UPDATE SET
    species           = EXCLUDED.species,
    preferred_gender  = EXCLUDED.preferred_gender,
    age_group         = EXCLUDED.age_group,
    district_id       = EXCLUDED.district_id,
    wants_vaccinated  = EXCLUDED.wants_vaccinated,
    wants_neutered    = EXCLUDED.wants_neutered,
    has_other_pets    = EXCLUDED.has_other_pets,
    home_type         = EXCLUDED.home_type,
    updated_at        = now();
END;
$$;

-- ── get_adoption_matches(user_id, limit) RPC ──────────────────────────────────
-- Scores available adoption_listings against the user's adopter_preferences.
-- Scoring rubric (max 100 pts):
--   species match        : 35 pts
--   gender match         : 15 pts
--   age_group match      : 15 pts
--   district match       : 15 pts
--   vaccinated match     : 10 pts
--   neutered match       : 10 pts
--
-- Returns rows ordered by score DESC, limited to p_limit.
-- Also upserts a row in adoption_match_logs for each result.

CREATE OR REPLACE FUNCTION public.get_adoption_matches(
  p_user_id  uuid,
  p_limit    integer DEFAULT 10
)
RETURNS TABLE (
  listing_id    uuid,
  score         integer,
  species       text,
  gender        text,
  age_months    integer,
  title_bn      text,
  title_en      text,
  description_bn text,
  description_en text,
  photos        text[],
  is_vaccinated boolean,
  is_neutered   boolean,
  district_id   integer,
  status        text,
  created_at    timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefs public.adopter_preferences%ROWTYPE;
  v_age_group text;
BEGIN
  -- Fetch preferences; if none, return top-20 listings ordered by newest
  SELECT * INTO v_prefs FROM public.adopter_preferences WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN QUERY
      SELECT
        al.id,
        50 AS score,
        al.species::text,
        al.gender::text,
        al.age_months,
        al.title_bn,
        al.title_en,
        al.description_bn,
        al.description_en,
        al.photos,
        al.is_vaccinated,
        al.is_neutered,
        al.district_id,
        al.status::text,
        al.created_at
      FROM public.adoption_listings al
      WHERE al.status = 'available'
      ORDER BY al.created_at DESC
      LIMIT p_limit;
    RETURN;
  END IF;

  RETURN QUERY
    WITH scored AS (
      SELECT
        al.id,
        (
          -- species (35 pts)
          CASE WHEN v_prefs.species = 'any' OR al.species::text = v_prefs.species THEN 35 ELSE 0 END
          -- gender (15 pts)
          + CASE WHEN v_prefs.preferred_gender = 'any' OR al.gender::text = v_prefs.preferred_gender THEN 15 ELSE 0 END
          -- age_group (15 pts) — derived from age_months
          + CASE
              WHEN v_prefs.age_group = 'any' THEN 15
              WHEN v_prefs.age_group = 'baby'   AND al.age_months IS NOT NULL AND al.age_months < 6   THEN 15
              WHEN v_prefs.age_group = 'young'  AND al.age_months IS NOT NULL AND al.age_months BETWEEN 6 AND 23  THEN 15
              WHEN v_prefs.age_group = 'adult'  AND al.age_months IS NOT NULL AND al.age_months BETWEEN 24 AND 95 THEN 15
              WHEN v_prefs.age_group = 'senior' AND al.age_months IS NOT NULL AND al.age_months >= 96  THEN 15
              ELSE 0
            END
          -- district (15 pts)
          + CASE WHEN v_prefs.district_id IS NULL OR al.district_id = v_prefs.district_id THEN 15 ELSE 0 END
          -- vaccinated (10 pts)
          + CASE WHEN NOT v_prefs.wants_vaccinated OR al.is_vaccinated THEN 10 ELSE 0 END
          -- neutered (10 pts)
          + CASE WHEN NOT v_prefs.wants_neutered OR al.is_neutered THEN 10 ELSE 0 END
        ) AS match_score,
        al.species,
        al.gender,
        al.age_months,
        al.title_bn,
        al.title_en,
        al.description_bn,
        al.description_en,
        al.photos,
        al.is_vaccinated,
        al.is_neutered,
        al.district_id,
        al.status,
        al.created_at
      FROM public.adoption_listings al
      WHERE al.status = 'available'
    )
    SELECT
      s.id,
      s.match_score,
      s.species::text,
      s.gender::text,
      s.age_months,
      s.title_bn,
      s.title_en,
      s.description_bn,
      s.description_en,
      s.photos,
      s.is_vaccinated,
      s.is_neutered,
      s.district_id,
      s.status::text,
      s.created_at
    FROM scored s
    ORDER BY s.match_score DESC, s.created_at DESC
    LIMIT p_limit;

  -- Log the matches (upsert to avoid duplicates)
  INSERT INTO public.adoption_match_logs (user_id, listing_id, score)
    SELECT p_user_id, r.listing_id, r.score
    FROM (
      SELECT s2.id AS listing_id, s2.match_score AS score
      FROM (
        SELECT
          al2.id,
          (
            CASE WHEN v_prefs.species = 'any' OR al2.species::text = v_prefs.species THEN 35 ELSE 0 END
            + CASE WHEN v_prefs.preferred_gender = 'any' OR al2.gender::text = v_prefs.preferred_gender THEN 15 ELSE 0 END
            + CASE
                WHEN v_prefs.age_group = 'any' THEN 15
                WHEN v_prefs.age_group = 'baby'   AND al2.age_months IS NOT NULL AND al2.age_months < 6   THEN 15
                WHEN v_prefs.age_group = 'young'  AND al2.age_months IS NOT NULL AND al2.age_months BETWEEN 6 AND 23  THEN 15
                WHEN v_prefs.age_group = 'adult'  AND al2.age_months IS NOT NULL AND al2.age_months BETWEEN 24 AND 95 THEN 15
                WHEN v_prefs.age_group = 'senior' AND al2.age_months IS NOT NULL AND al2.age_months >= 96  THEN 15
                ELSE 0
              END
            + CASE WHEN v_prefs.district_id IS NULL OR al2.district_id = v_prefs.district_id THEN 15 ELSE 0 END
            + CASE WHEN NOT v_prefs.wants_vaccinated OR al2.is_vaccinated THEN 10 ELSE 0 END
            + CASE WHEN NOT v_prefs.wants_neutered OR al2.is_neutered THEN 10 ELSE 0 END
          ) AS match_score
        FROM public.adoption_listings al2
        WHERE al2.status = 'available'
        ORDER BY match_score DESC
        LIMIT p_limit
      ) s2
    ) r
  ON CONFLICT (user_id, listing_id) DO UPDATE SET
    score       = EXCLUDED.score,
    surfaced_at = now();
END;
$$;

-- ── Grants ────────────────────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON public.adopter_preferences TO authenticated;
GRANT SELECT ON public.adoption_match_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_adopter_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_adoption_matches TO authenticated;
