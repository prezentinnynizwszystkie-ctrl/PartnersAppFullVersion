
-- Dodanie kolumny Gender do tabeli Stories w schemacie PartnersApp
ALTER TABLE "PartnersApp"."Stories" 
ADD COLUMN IF NOT EXISTS "Gender" TEXT DEFAULT 'Uniwersalna';

-- Odświeżenie cache API
NOTIFY pgrst, 'reload config';
