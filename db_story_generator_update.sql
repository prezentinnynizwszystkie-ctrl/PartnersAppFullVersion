
-- 1. Upewnij się, że kolumna Lektorzy istnieje (JSONB)
ALTER TABLE "PartnersApp"."Stories" 
ADD COLUMN IF NOT EXISTS "Lektorzy" JSONB;

-- 2. Upewnij się, że kolumna Scenario istnieje
ALTER TABLE "PartnersApp"."Stories" 
ADD COLUMN IF NOT EXISTS "Scenario" JSONB;

-- 3. Odświeżamy cache
NOTIFY pgrst, 'reload config';
