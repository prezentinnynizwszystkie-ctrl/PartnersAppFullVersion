
-- 1. Tworzymy typ wyliczeniowy (jeśli nie istnieje)
DO $$ BEGIN
    CREATE TYPE "PartnersApp"."app_role" AS ENUM ('ADMIN', 'HANDLOWIEC', 'PARTNER', 'KLIENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Sprzątamy dane (wielkie litery, fallback do KLIENT)
UPDATE "PartnersApp"."Profiles" SET role = UPPER(role);
UPDATE "PartnersApp"."Profiles" SET role = 'KLIENT' WHERE role NOT IN ('ADMIN', 'HANDLOWIEC', 'PARTNER', 'KLIENT');

-- 3. USUWANIE BLOKAD (To jest klucz do naprawy błędu 0A000)
-- Musimy usunąć polityki, które "patrzą" na kolumnę role, zanim zmienimy jej typ.
DROP POLICY IF EXISTS "Handlowcy Create Partners" ON "PartnersApp"."Partners";
DROP POLICY IF EXISTS "Handlowcy Update Own Partners" ON "PartnersApp"."Partners";

-- Usuwamy też stare ograniczenie CHECK, jeśli istnieje
ALTER TABLE "PartnersApp"."Profiles" DROP CONSTRAINT IF EXISTS "Profiles_role_check";

-- 4. ZMIANA TYPU KOLUMNY (Teraz już nic jej nie blokuje)
ALTER TABLE "PartnersApp"."Profiles"
ALTER COLUMN "role" TYPE "PartnersApp"."app_role"
USING role::"PartnersApp"."app_role";

-- Ustawiamy domyślną wartość
ALTER TABLE "PartnersApp"."Profiles" ALTER COLUMN "role" SET DEFAULT 'KLIENT';

-- 5. PRZYWRACANIE POLITYK (Dostosowane do typu ENUM)

-- Polityka: Handlowcy (i Admini) mogą tworzyć partnerów
CREATE POLICY "Handlowcy Create Partners" ON "PartnersApp"."Partners"
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "PartnersApp"."Profiles"
    WHERE id = auth.uid() 
    -- Rzutujemy string na typ enum dla pewności
    AND (role = 'HANDLOWIEC'::"PartnersApp"."app_role" OR role = 'ADMIN'::"PartnersApp"."app_role")
  )
);

-- Polityka: Handlowcy edytują tylko swoich partnerów
CREATE POLICY "Handlowcy Update Own Partners" ON "PartnersApp"."Partners"
FOR UPDATE
USING (
  "IdOpiekuna" IN (
    SELECT handlowiec_id FROM "PartnersApp"."Profiles" WHERE id = auth.uid()
  )
  OR
  EXISTS (SELECT 1 FROM "PartnersApp"."Profiles" WHERE id = auth.uid() AND role = 'ADMIN'::"PartnersApp"."app_role")
);
