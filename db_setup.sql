-- 1. Create the Schema
CREATE SCHEMA IF NOT EXISTS "PartnersApp";

-- 2. Permissions for Schema Access
GRANT USAGE ON SCHEMA "PartnersApp" TO anon;
GRANT USAGE ON SCHEMA "PartnersApp" TO service_role;
GRANT USAGE ON SCHEMA "PartnersApp" TO authenticated;

-- 3. Create Table: Handlowcy
CREATE TABLE IF NOT EXISTS "PartnersApp"."Handlowcy" (
    "id" SERIAL PRIMARY KEY,
    "imie" TEXT,
    "nazwisko" TEXT,
    "telefon" TEXT,
    "email" TEXT,
    "login" TEXT,
    "haslo" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "SprzedazSuma" NUMERIC
);

-- 4. Create Table: Partners
CREATE TABLE IF NOT EXISTS "PartnersApp"."Partners" (
    "Id" SERIAL PRIMARY KEY,
    "PartnerType" TEXT,
    "PartnerName" TEXT NOT NULL,
    "IdOpiekuna" INTEGER REFERENCES "PartnersApp"."Handlowcy"("id"),
    "Opiekun" JSONB,
    "ContactPerson" JSONB,
    "Informacje" JSONB,
    "Status" TEXT DEFAULT 'BRAK',
    "Model" TEXT DEFAULT 'BRAK',
    "SellPrice" NUMERIC,
    "Prowizja" NUMERIC,
    "ProwizjaObsluga" NUMERIC,
    "SprzedazIlosc" NUMERIC,
    "SprzedazWartosc" NUMERIC,
    "Slug" TEXT UNIQUE NOT NULL,
    "LogoUrl" TEXT,
    "Theme" JSONB,
    CONSTRAINT "check_status" CHECK ("Status" IN ('AKTYWNY', 'NIEAKTYWNY', 'BRAK')),
    CONSTRAINT "check_model" CHECK ("Model" IN ('PROWIZJA', 'PAKIET', 'BRAK'))
);

-- 5. Create Table: PartnersCodes
CREATE TABLE IF NOT EXISTS "PartnersApp"."PartnersCodes" (
    "Id" SERIAL PRIMARY KEY,
    "PartnerId" INTEGER REFERENCES "PartnersApp"."Partners"("Id"),
    "PartnerName" TEXT
);

-- 6. CRITICAL FIX: Disable Row Level Security to allow 'anon' access without policies
ALTER TABLE "PartnersApp"."Partners" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnersApp"."Handlowcy" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnersApp"."PartnersCodes" DISABLE ROW LEVEL SECURITY;

-- 7. Grant Select Permissions on TABLES (Must be run AFTER tables exist)
GRANT SELECT ON ALL TABLES IN SCHEMA "PartnersApp" TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA "PartnersApp" TO service_role;

-- 8. Insert Data: Handlowcy
INSERT INTO "PartnersApp"."Handlowcy" ("id", "imie", "nazwisko", "telefon", "email", "login", "haslo", "created_at")
VALUES 
(1, 'Piotr', 'Mazurkiewicz', '+48 693 374 300', 'piotr@prezentinnynizwszystkie.pl', 'piotrek', 'piotrek69!', '2026-01-28 20:32:44.48777+00'),
(2, 'Grzegorz', 'Rabczak', '501031430', 'grzegorz@prezentinnynizwszystkie.pl', 'grzesiek', 'grzesiek69*', '2026-01-28 20:32:44.48777+00'),
(3, 'Michał', 'Mazurkiewicz', '508528528', 'biuro@prezentinnynizwszystkie.pl', 'michal', 'test', '2026-01-28 20:32:44.48777+00')
ON CONFLICT ("id") DO NOTHING;

SELECT setval(pg_get_serial_sequence('"PartnersApp"."Handlowcy"', 'id'), COALESCE((SELECT MAX("id") FROM "PartnersApp"."Handlowcy"), 1));

-- 9. Insert Data: Partners
INSERT INTO "PartnersApp"."Partners" (
    "PartnerType", "PartnerName", "IdOpiekuna", "Status", "Model", "Slug", "LogoUrl", "Theme"
) VALUES (
    'Sala Zabaw',
    'Fikolandia',
    1,
    'AKTYWNY',
    'PROWIZJA',
    'fikolandia',
    'https://cdn-icons-png.flaticon.com/512/3063/3063822.png', 
    '{"primaryColor": "#8b5cf6", "accentColor": "#f472b6", "fontFamily": "Outfit"}'
) ON CONFLICT ("Slug") DO NOTHING;

INSERT INTO "PartnersApp"."Partners" (
    "PartnerType", "PartnerName", "IdOpiekuna", "Status", "Model", "Slug", "LogoUrl", "Theme"
) VALUES (
    'Park Rozrywki',
    'DinoPark',
    2,
    'AKTYWNY',
    'PAKIET',
    'dinopark',
    'https://cdn-icons-png.flaticon.com/512/2313/2313469.png',
    '{"primaryColor": "#16a34a", "accentColor": "#eab308", "fontFamily": "Inter"}'
) ON CONFLICT ("Slug") DO NOTHING;

INSERT INTO "PartnersApp"."Partners" (
    "PartnerType", "PartnerName", "IdOpiekuna", "Status", "Model", "Slug", "LogoUrl", "Theme"
) VALUES (
    'Centrum Nauki',
    'AstroPlaneta',
    3,
    'AKTYWNY',
    'PROWIZJA',
    'astro',
    'https://cdn-icons-png.flaticon.com/512/3212/3212567.png',
    '{"primaryColor": "#0ea5e9", "accentColor": "#6366f1", "fontFamily": "Outfit"}'
) ON CONFLICT ("Slug") DO NOTHING;