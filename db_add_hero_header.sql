
-- 1. Dodajemy kolumnę na niestandardowy nagłówek Hero
ALTER TABLE "PartnersApp"."Partners" 
ADD COLUMN IF NOT EXISTS "HeroHeader" TEXT;

-- 2. Odświeżamy cache schematu
NOTIFY pgrst, 'reload config';
