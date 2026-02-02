
-- 1. Utworzenie typów ENUM (jeśli nie istnieją)
DO $$ BEGIN
    CREATE TYPE "PartnersApp"."partner_status" AS ENUM ('AKTYWNY', 'NIEAKTYWNY', 'BRAK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PartnersApp"."partner_model" AS ENUM ('PAKIET', 'PROWIZJA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Dodanie kolumny PhotoUrl
ALTER TABLE "PartnersApp"."Partners" 
ADD COLUMN IF NOT EXISTS "PhotoUrl" TEXT;

-- 3. Migracja kolumny Status na ENUM
-- Usuwamy stare constrainty
ALTER TABLE "PartnersApp"."Partners" DROP CONSTRAINT IF EXISTS "check_status";

-- CRITICAL FIX: Najpierw usuwamy starą wartość domyślną (text 'BRAK'), która blokuje zmianę typu
ALTER TABLE "PartnersApp"."Partners" ALTER COLUMN "Status" DROP DEFAULT;

-- Upewniamy się, że dane pasują do enuma (fallback do 'BRAK')
UPDATE "PartnersApp"."Partners" 
SET "Status" = 'BRAK'::"PartnersApp"."partner_status"
WHERE "Status" IS NULL OR "Status" NOT IN ('AKTYWNY', 'NIEAKTYWNY', 'BRAK');

-- Zmieniamy typ na ENUM
ALTER TABLE "PartnersApp"."Partners"
ALTER COLUMN "Status" TYPE "PartnersApp"."partner_status"
USING "Status"::"PartnersApp"."partner_status";

-- Ustawiamy nową domyślną wartość (zgodną z typem ENUM)
ALTER TABLE "PartnersApp"."Partners"
ALTER COLUMN "Status" SET DEFAULT 'BRAK'::"PartnersApp"."partner_status";

-- 4. Migracja kolumny Model na ENUM
-- Usuwamy stare constrainty
ALTER TABLE "PartnersApp"."Partners" DROP CONSTRAINT IF EXISTS "check_model";

-- CRITICAL FIX: Usuwamy starą wartość domyślną
ALTER TABLE "PartnersApp"."Partners" ALTER COLUMN "Model" DROP DEFAULT;

-- Czyścimy dane: Jeśli Model to 'BRAK' lub coś innego niż PAKIET/PROWIZJA, ustawiamy NULL (bo w enumie nie ma BRAK)
UPDATE "PartnersApp"."Partners" 
SET "Model" = NULL
WHERE "Model" NOT IN ('PAKIET', 'PROWIZJA');

-- Zmieniamy typ na ENUM
ALTER TABLE "PartnersApp"."Partners"
ALTER COLUMN "Model" TYPE "PartnersApp"."partner_model"
USING "Model"::"PartnersApp"."partner_model";

-- 5. Odświeżenie cache PostgREST
NOTIFY pgrst, 'reload config';
