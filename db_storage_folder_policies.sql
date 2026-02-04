
BEGIN;

-- 1. Resetujemy polityki storage (czyścimy wszystko co było)
DROP POLICY IF EXISTS "Public Select PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated All PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Delete PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Files PartnersApp" ON storage.objects; -- Z poprzedniego kroku

-- 2. POLITYKA: Publiczny Odczyt (SELECT) - TYLKO DLA KONKRETNYCH FOLDERÓW
-- Pozwalamy czytać tylko: UniversalPhotos, UniversalVideos, Avatars oraz Loga Partnerów.
-- BLOKUJEMY czytanie folderu "Orders" (zdjęcia dzieci) dla anonimów.
CREATE POLICY "Public Read Specific Folders"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'PartnersApp'
  AND (
    name LIKE 'UniversalPhotos/%' OR
    name LIKE 'UniversalVideos/%' OR
    name LIKE 'Avatars/%' OR
    name LIKE 'Partners/%' -- Loga i umowy (umowy warto przenieść do secure, ale loga muszą być tu)
  )
);

-- 3. POLITYKA: Publiczny Zapis (INSERT) - "Blind Drop"
-- Każdy może wrzucić plik do folderu Orders, ale dzięki braku SELECT powyżej, nie może go potem zobaczyć (chyba że ma link w aplikacji tuż po wgraniu).
CREATE POLICY "Public Insert Orders Only"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'PartnersApp' 
  AND name LIKE 'Orders/%'
);

-- 4. POLITYKA: Administrator (Zalogowany)
-- Ma pełny dostęp do wszystkiego (może czytać zdjęcia dzieci, usuwać stare pliki).
CREATE POLICY "Admin Full Access Storage"
ON storage.objects FOR ALL
USING (
  bucket_id = 'PartnersApp' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'PartnersApp' 
  AND auth.role() = 'authenticated'
);

COMMIT;
