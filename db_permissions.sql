
-- 1. Włączamy RLS na tabeli Partners (jeśli było wyłączone, teraz włączamy dla bezpieczeństwa)
ALTER TABLE "PartnersApp"."Partners" ENABLE ROW LEVEL SECURITY;

-- 2. Polityka: Wszyscy mogą CZYTAĆ (Select) - potrzebne dla strony głównej i logowania
DROP POLICY IF EXISTS "Public Read Partners" ON "PartnersApp"."Partners";
CREATE POLICY "Public Read Partners" ON "PartnersApp"."Partners"
FOR SELECT USING (true);

-- 3. Polityka: Handlowcy (i Admini) mogą DODAWAĆ (Insert) nowych Partnerów
-- Sprawdzamy, czy użytkownik ma rolę HANDLOWIEC lub ADMIN w tabeli Profiles
DROP POLICY IF EXISTS "Handlowcy Create Partners" ON "PartnersApp"."Partners";
CREATE POLICY "Handlowcy Create Partners" ON "PartnersApp"."Partners"
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "PartnersApp"."Profiles"
    WHERE id = auth.uid() 
    AND (role = 'HANDLOWIEC' OR role = 'ADMIN')
  )
);

-- 4. Polityka: Handlowcy mogą EDYTOWAĆ swoich partnerów
DROP POLICY IF EXISTS "Handlowcy Update Own Partners" ON "PartnersApp"."Partners";
CREATE POLICY "Handlowcy Update Own Partners" ON "PartnersApp"."Partners"
FOR UPDATE
USING (
  "IdOpiekuna" IN (
    SELECT handlowiec_id FROM "PartnersApp"."Profiles" WHERE id = auth.uid()
  )
  OR
  EXISTS (SELECT 1 FROM "PartnersApp"."Profiles" WHERE id = auth.uid() AND role = 'ADMIN')
);
