
-- SKRYPT NAPRAWCZY - URUCHOM W SUPABASE SQL EDITOR
-- Ten skrypt sprawdza i dodaje brakujące kolumny, które powodują błędy zapisu.

-- 1. Dodanie kolumny contact_number (jeśli nie istnieje)
ALTER TABLE "PartnersApp"."Partners" 
ADD COLUMN IF NOT EXISTS "contact_number" TEXT;

-- 2. Dodanie kolumny contact_email (jeśli nie istnieje)
ALTER TABLE "PartnersApp"."Partners" 
ADD COLUMN IF NOT EXISTS "contact_email" TEXT;

-- 3. Dodanie kolumny Miasto (jeśli nie istnieje)
ALTER TABLE "PartnersApp"."Partners" 
ADD COLUMN IF NOT EXISTS "Miasto" TEXT;

-- 4. Dodanie kolumny UmowaUrl (jeśli nie istnieje)
ALTER TABLE "PartnersApp"."Partners" 
ADD COLUMN IF NOT EXISTS "UmowaUrl" TEXT;

-- 5. Dodanie kolumny PartnerNameGenitive (jeśli nie istnieje)
ALTER TABLE "PartnersApp"."Partners" 
ADD COLUMN IF NOT EXISTS "PartnerNameGenitive" TEXT;

-- 6. Upewnienie się, że ENUM Status ma wartość 'NIEAKTYWNY'
ALTER TYPE "PartnersApp"."partner_status" ADD VALUE IF NOT EXISTS 'NIEAKTYWNY';

-- 7. Odświeżenie cache API (Kluczowe, żeby widzieć nowe kolumny w aplikacji)
NOTIFY pgrst, 'reload config';
