
BEGIN;

-- 1. ZABEZPIECZENIE TABELI PARTNERS (Tylko Admin usuwa partnerów)
DROP POLICY IF EXISTS "Authenticated Delete Partners" ON "PartnersApp"."Partners";
DROP POLICY IF EXISTS "Handlowcy Delete Partners" ON "PartnersApp"."Partners";
DROP POLICY IF EXISTS "Admin Delete Partners" ON "PartnersApp"."Partners";

CREATE POLICY "Admin Delete Partners" ON "PartnersApp"."Partners"
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM "PartnersApp"."Profiles" 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'::"PartnersApp"."app_role"
  )
);

-- 2. ZABEZPIECZENIE STORAGE (Tylko Admin usuwa pliki)
-- Resetujemy stare polityki usuwania dla storage
DROP POLICY IF EXISTS "Authenticated Delete PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Delete PartnersApp" ON storage.objects; 

-- Tworzymy nową, restrykcyjną politykę DELETE
CREATE POLICY "Admin Delete Files PartnersApp" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'PartnersApp'
  AND EXISTS (
    SELECT 1 FROM "PartnersApp"."Profiles" 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'::"PartnersApp"."app_role"
  )
);

-- (Musimy przywrócić UPDATE dla Handlowców, bo usunęliśmy politykę łączoną Update/Delete powyżej)
CREATE POLICY "Authenticated Update Files PartnersApp" ON storage.objects
FOR UPDATE
USING ( bucket_id = 'PartnersApp' AND auth.role() = 'authenticated' )
WITH CHECK ( bucket_id = 'PartnersApp' AND auth.role() = 'authenticated' );


-- 3. ZABEZPIECZENIE STORIES (Tylko Admin usuwa bajki)
-- Zakładamy, że wcześniej była tu polityka "Admin All Stories", która pozwalała na wszystko.
-- Jeśli chcemy być precyzyjni, DELETE musi być explicit.

-- Najpierw upewniamy się, że RLS jest włączone (dla Stories mogło być wyłączone w ramach fixów)
ALTER TABLE "PartnersApp"."Stories" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin All Stories" ON "PartnersApp"."Stories";

-- Polityka dla SELECT/INSERT/UPDATE (Admin + ewentualnie Handlowiec jeśli ma mieć prawo edycji)
CREATE POLICY "Authenticated Manage Stories" ON "PartnersApp"."Stories"
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Nadpisanie specyficznie dla DELETE (Supabase używa polityk addytywnych, więc musimy uważać. 
-- Najbezpieczniej: Zrobić osobną politykę na DELETE i wyłączyć DELETE z "Manage").

DROP POLICY "Authenticated Manage Stories" ON "PartnersApp"."Stories";

-- A. Odczyt/Zapis/Edycja dla zalogowanych
CREATE POLICY "Authenticated Read Write Stories" ON "PartnersApp"."Stories"
FOR SELECT USING (true); -- Czytanie publiczne (dla wizarda)

CREATE POLICY "Authenticated Insert Update Stories" ON "PartnersApp"."Stories"
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated Update Stories" ON "PartnersApp"."Stories"
FOR UPDATE USING (auth.role() = 'authenticated');

-- B. Usuwanie TYLKO dla Admina
CREATE POLICY "Admin Delete Stories" ON "PartnersApp"."Stories"
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM "PartnersApp"."Profiles" 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'::"PartnersApp"."app_role"
  )
);

COMMIT;
