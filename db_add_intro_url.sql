
-- 1. Dodajemy kolumnę na URL pliku audio intro
ALTER TABLE "PartnersApp"."Partners" 
ADD COLUMN IF NOT EXISTS "IntroUrl" TEXT;

-- 2. Odświeżamy cache schematu
NOTIFY pgrst, 'reload config';
