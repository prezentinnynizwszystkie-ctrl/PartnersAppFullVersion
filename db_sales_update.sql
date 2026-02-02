
-- 1. Dodanie kolumn
ALTER TABLE "PartnersApp"."Partners" 
ADD COLUMN IF NOT EXISTS "Miasto" TEXT,
ADD COLUMN IF NOT EXISTS "UmowaUrl" TEXT;

-- 2. Aktualizacja typu ENUM dla Modelu (dodanie 'BRAK')
-- Uwaga: ALTER TYPE nie może być w bloku transakcji w niektórych wersjach, więc wykonujemy to bezpośrednio.
ALTER TYPE "PartnersApp"."partner_model" ADD VALUE IF NOT EXISTS 'BRAK';

-- 3. Odświeżenie cache schema
NOTIFY pgrst, 'reload config';
