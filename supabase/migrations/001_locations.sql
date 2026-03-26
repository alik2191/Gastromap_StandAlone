-- ═══════════════════════════════════════════════════════════════
-- GastroMap — Locations table
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.locations (
    id              uuid primary key default gen_random_uuid(),
    title           text        not null,
    description     text,
    address         text,
    city            text        not null,
    country         text        not null,
    lat             numeric(10,7),
    lng             numeric(10,7),
    category        text,
    cuisine         text,
    image           text,
    photos          text[]      default '{}',
    rating          numeric(3,1) default 0,
    price_level     text        default '$$',
    opening_hours   text,
    tags            text[]      default '{}',
    special_labels  text[]      default '{}',
    vibe            text[]      default '{}',
    features        text[]      default '{}',
    best_for        text[]      default '{}',
    dietary         text[]      default '{}',
    has_wifi        boolean     default false,
    has_outdoor_seating boolean default false,
    reservations_required boolean default false,
    michelin_stars  smallint    default 0,
    michelin_bib    boolean     default false,
    -- AI expert fields (not exposed in public UI)
    insider_tip     text,
    what_to_try     text[]      default '{}',
    ai_keywords     text[]      default '{}',
    ai_context      text,
    -- Meta
    status          text        default 'active',  -- active | hidden | coming_soon
    created_at      timestamptz default now(),
    updated_at      timestamptz default now()
);

-- Full-text search index
create index if not exists locations_fts_idx
    on public.locations using gin(
        to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(city,'') || ' ' || coalesce(cuisine,''))
    );

-- Category & city indexes for filter queries
create index if not exists locations_category_idx on public.locations(category);
create index if not exists locations_city_idx      on public.locations(city);
create index if not exists locations_status_idx    on public.locations(status);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists locations_updated_at on public.locations;
create trigger locations_updated_at
    before update on public.locations
    for each row execute function public.set_updated_at();

-- RLS: anyone can read active locations; only service role can write
alter table public.locations enable row level security;

create policy "Public read active locations"
    on public.locations for select
    using (status = 'active');

create policy "Service role full access"
    on public.locations for all
    using (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════
-- Seed data — migrated from MOCK_LOCATIONS
-- ═══════════════════════════════════════════════════════════════

insert into public.locations (
    id, title, description, address, city, country, lat, lng,
    category, cuisine, image, rating, price_level, opening_hours,
    tags, special_labels, vibe, features, best_for, dietary,
    has_wifi, has_outdoor_seating, reservations_required,
    michelin_stars, michelin_bib,
    insider_tip, what_to_try, ai_keywords, ai_context
) values (
    '00000000-0000-0000-0000-000000000001',
    'Cafe Camelot',
    'Historic cafe in the heart of Krakow with a vintage atmosphere.',
    'Świętego Tomasza 17, 31-022 Kraków',
    'Krakow', 'Poland',
    50.0619, 19.9368,
    'Cafe', 'French',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop',
    4.8, '$$', '09:00 - 23:00',
    ARRAY['Vintage','Coffee','Cakes'],
    ARRAY['Delicious Desserts','Specialty Coffee'],
    ARRAY['Romantic','Casual'],
    ARRAY['Outdoor Seating','Cakes'],
    ARRAY['date','solo','friends'],
    ARRAY['vegetarian'],
    true, true, false, 0, false,
    'Ask for the window seat on the first floor — best view of the courtyard.',
    ARRAY['Cheesecake with cherry compote','French press coffee','Croissant almond'],
    ARRAY['proposal spot','anniversary coffee','book lover','slow morning','sunday brunch','freelancer friendly','tourist favorite','hidden courtyard','authentic old krakow','instagrammable interior'],
    'Perfect for first dates or quiet solo time. Locals love it for its timeless vibe — unchanged since the 80s. Great for people who want to feel Krakow history.'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Hamsa Hummus & Happiness',
    'Modern Israeli cuisine in the heart of Kazimierz.',
    'Szeroka 2, 31-053 Kraków',
    'Krakow', 'Poland',
    50.0516, 19.9486,
    'Restaurant', 'Israeli',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop',
    4.6, '$$', '10:00 - 22:00',
    ARRAY['Israeli','Vegan Friendly','Hummus'],
    ARRAY['Signature Cuisine','Vegan Menu'],
    ARRAY['Energetic','Casual'],
    ARRAY['Pet-friendly','Vegetarian Options'],
    ARRAY['family','friends','groups','solo'],
    ARRAY['vegan','vegetarian','gluten-free options'],
    true, false, false, 0, false,
    'The shakshuka is not on the main menu but available all day — just ask.',
    ARRAY['Hummus Baghdad','Shakshuka','Halva ice cream','Pita bread fresh from oven'],
    ARRAY['vegan paradise','middle eastern','healthy food','lunch spot','kazimierz jewish quarter','budget friendly','group friendly','halal','authentic hummus','instagrammable dishes'],
    'Best hummus in Krakow — thick, warm, authentic. Great for vegans and vegetarians. Very loud and lively during weekends — not ideal for quiet conversation.'
),
(
    '00000000-0000-0000-0000-000000000003',
    'Szara Gęś',
    'Fine dining experience on the Main Square.',
    'Rynek Główny 17, 31-008 Kraków',
    'Krakow', 'Poland',
    50.0608, 19.9376,
    'Fine Dining', 'Polish',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1000&auto=format&fit=crop',
    4.9, '$$$$', '12:00 - 23:00',
    ARRAY['Fine Dining','Polish','Market Square'],
    ARRAY['Michelin Recommended','Chef''s Table'],
    ARRAY['Romantic','Sophisticated'],
    ARRAY['Wine Cellar','Private Dining'],
    ARRAY['date','anniversary','business'],
    ARRAY['vegetarian options'],
    false, true, true, 0, true,
    'Book the private cellar room for anniversaries — they set it up with candles and flowers if you ask in advance.',
    ARRAY['Duck confit','Żurek soup','Tasting menu','House-made pierogi'],
    ARRAY['anniversary dinner','michelin bib','fine polish cuisine','business dinner','special occasion','market square view','romantic dinner','upscale krakow','chef tasting','wine pairing'],
    'The most upscale Polish restaurant on the Main Square. Bib Gourmand rated. Perfect for celebrating something important. Service is impeccable but formal — not for casual evenings.'
),
(
    '00000000-0000-0000-0000-000000000004',
    'Pod Norenami',
    'Authentic Japanese ramen in the heart of Krakow.',
    'Krupnicza 6, 31-123 Kraków',
    'Krakow', 'Poland',
    50.0634, 19.9286,
    'Restaurant', 'Japanese',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1000&auto=format&fit=crop',
    4.7, '$$', '12:00 - 22:00',
    ARRAY['Ramen','Japanese','Noodles'],
    ARRAY['Authentic Ramen','Asian Cuisine'],
    ARRAY['Cozy','Casual'],
    ARRAY['Quick Service','Takeaway'],
    ARRAY['solo','friends','lunch'],
    ARRAY['vegan options'],
    false, false, false, 0, false,
    'Arrive before 1pm to avoid the lunch queue. The tonkotsu sells out by 8pm.',
    ARRAY['Tonkotsu ramen','Miso ramen','Gyoza','Matcha latte'],
    ARRAY['ramen lover','japanese food','quick lunch','umami','noodle bowl','asian cuisine krakow','comfort food','rainy day lunch','student favorite','budget friendly'],
    'Best ramen in Krakow — small place, always packed. Broth simmered 12 hours. No reservations so come early. Cash only.'
)
on conflict (id) do nothing;
