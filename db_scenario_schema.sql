
-- 1. Dodanie kolumny Schema (na techniczny szkielet DSL: "SampleLine: Code=S1")
ALTER TABLE "PartnersApp"."Stories" 
ADD COLUMN IF NOT EXISTS "Schema" TEXT;

-- 2. Upewnienie się, że Scenario jest typu JSONB (na treść i warianty)
-- Jeśli była TEXT, musimy ją przekonwertować (może wyczyścić stare dane tekstowe jeśli nie są JSONem)
-- W środowisku dev zakładamy, że możemy nadpisać lub że już jest JSONB.
ALTER TABLE "PartnersApp"."Stories" 
ALTER COLUMN "Scenario" TYPE JSONB USING "Scenario"::JSONB;

-- 3. Odświeżenie cache API
NOTIFY pgrst, 'reload config';
