-- Auto-Translation System for Locations
-- Date: 2026-03-31
-- Description: Automatic translation of location data to multiple languages

-- Create location_translations table
CREATE TABLE IF NOT EXISTS public.location_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    translations JSONB NOT NULL DEFAULT '{}',
    -- Structure:
    -- {
    --   "en": {
    --     "title": "...",
    --     "description": "...",
    --     "address": "...",
    --     "insider_tip": "...",
    --     "what_to_try": [...],
    --     "ai_context": "...",
    --     "translated_at": "2026-03-31T..."
    --   },
    --   "pl": { ... },
    --   "uk": { ... },
    --   "ru": { ... }
    -- }
    source_language VARCHAR(2) DEFAULT 'auto',
    translation_model VARCHAR(100) DEFAULT 'openrouter',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(location_id)
);

-- Create index on location_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_location_translations_location_id 
    ON public.location_translations(location_id);

-- Create index on updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_location_translations_updated_at 
    ON public.location_translations(updated_at DESC);

-- Create index on JSONB for language queries
CREATE INDEX IF NOT EXISTS idx_location_translations_languages 
    ON public.location_translations USING GIN (translations);

-- Enable RLS
ALTER TABLE public.location_translations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view translations
CREATE POLICY "Anyone can view translations"
    ON public.location_translations
    FOR SELECT
    USING (true);

-- Policy: Authenticated users can create translations
CREATE POLICY "Authenticated users can create translations"
    ON public.location_translations
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Policy: Admins and moderators can update translations
CREATE POLICY "Admins and moderators can update translations"
    ON public.location_translations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('admin', 'moderator')
        )
    );

-- Policy: Admins can delete translations
CREATE POLICY "Admins can delete translations"
    ON public.location_translations
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_translation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER set_updated_at_translations
    BEFORE UPDATE ON public.location_translations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_translation_updated_at();

-- Function to get location with translation for specific language
CREATE OR REPLACE FUNCTION public.get_location_translated(
    p_location_id UUID,
    p_language VARCHAR(2) DEFAULT 'en'
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    description TEXT,
    address VARCHAR,
    city VARCHAR,
    country VARCHAR,
    lat DECIMAL,
    lng DECIMAL,
    category VARCHAR,
    cuisine VARCHAR,
    image TEXT,
    photos JSONB,
    rating DECIMAL,
    price_level VARCHAR,
    opening_hours TEXT,
    tags TEXT[],
    vibe TEXT[],
    features TEXT[],
    best_for TEXT[],
    dietary TEXT[],
    has_wifi BOOLEAN,
    has_outdoor_seating BOOLEAN,
    reservations_required BOOLEAN,
    michelin_stars INTEGER,
    michelin_bib BOOLEAN,
    insider_tip TEXT,
    what_to_try TEXT[],
    ai_keywords TEXT[],
    ai_context TEXT,
    status VARCHAR,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    translated_title VARCHAR,
    translated_description TEXT,
    translated_address VARCHAR,
    translated_insider_tip TEXT,
    translated_what_to_try TEXT[],
    translated_ai_context TEXT
) AS $$
DECLARE
    v_translations JSONB;
    v_translation JSONB;
BEGIN
    -- Get translations
    SELECT t.translations INTO v_translations
    FROM public.location_translations t
    WHERE t.location_id = p_location_id;
    
    -- Get specific language translation
    IF v_translations IS NOT NULL THEN
        v_translation := v_translations->p_language;
    END IF;
    
    -- Return location with translations
    RETURN QUERY
    SELECT 
        l.id,
        l.title,
        l.description,
        l.address,
        l.city,
        l.country,
        l.lat,
        l.lng,
        l.category,
        l.cuisine,
        l.image,
        l.photos,
        l.rating,
        l.price_level,
        l.opening_hours,
        l.tags,
        l.vibe,
        l.features,
        l.best_for,
        l.dietary,
        l.has_wifi,
        l.has_outdoor_seating,
        l.reservations_required,
        l.michelin_stars,
        l.michelin_bib,
        l.insider_tip,
        l.what_to_try,
        l.ai_keywords,
        l.ai_context,
        l.status,
        l.created_at,
        l.updated_at,
        -- Translated fields
        v_translation->>'title' AS translated_title,
        v_translation->>'description' AS translated_description,
        v_translation->>'address' AS translated_address,
        v_translation->>'insider_tip' AS translated_insider_tip,
        (v_translation->'what_to_try')::TEXT[] AS translated_what_to_try,
        v_translation->>'ai_context' AS translated_ai_context
    FROM public.locations l
    WHERE l.id = p_location_id
    AND l.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-translate location (called from trigger)
CREATE OR REPLACE FUNCTION public.auto_translate_location()
RETURNS TRIGGER AS $$
BEGIN
    -- This function would call an external API
    -- For now, we'll just log that translation is needed
    -- Actual translation happens in the frontend/backend API
    
    -- Insert placeholder for translations
    INSERT INTO public.location_translations (location_id, translations, source_language)
    VALUES (
        NEW.id,
        '{}'::jsonb,
        'auto'
    )
    ON CONFLICT (location_id)
    DO UPDATE SET
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create translation record when location is created
-- Note: Actual translation happens in API layer
DROP TRIGGER IF EXISTS on_location_created ON public.locations;
-- We don't auto-trigger translation to avoid blocking inserts
-- Translation is called explicitly from the API

COMMENT ON TABLE public.location_translations IS 'Auto-translated location data in multiple languages';
COMMENT ON COLUMN public.location_translations.translations IS 'JSON object with translations per language: {en: {...}, pl: {...}, uk: {...}, ru: {...}}';

-- Grant permissions
GRANT SELECT ON public.location_translations TO PUBLIC;
GRANT INSERT ON public.location_translations TO authenticated;
GRANT UPDATE ON public.location_translations TO authenticated;

