-- ============================================================
-- Fix: allow public read of 'approved' locations
-- Problem: original policy only allowed status='active',
--          but the app sets status='approved' for visible locations.
-- Applied directly via exec_sql on 2026-04-22.
-- ============================================================

DROP POLICY IF EXISTS "Public read active locations" ON public.locations;

CREATE POLICY "Public read approved locations"
    ON public.locations FOR SELECT
    USING (status IN ('active', 'approved', 'published'));
