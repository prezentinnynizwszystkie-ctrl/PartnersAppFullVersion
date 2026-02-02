
-- 1. Dodanie kolumny contact_number
ALTER TABLE "PartnersApp"."Partners" 
ADD COLUMN IF NOT EXISTS "contact_number" TEXT;

-- 2. Odświeżenie cache schematu
NOTIFY pgrst, 'reload config';
