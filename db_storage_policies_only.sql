
-- ============================================================================
-- TYLKO ZABEZPIECZENIE STORAGE (PLIKÓW)
-- Ten skrypt dotyczy WYŁĄCZNIE tabeli storage.objects (zdjęcia/wideo).
-- Nie rusza tabel z danymi ("PartnersApp", "birthdays").
-- ============================================================================

BEGIN;

-- 1. Usuwamy stare polityki dotyczące bucketa "PartnersApp", aby uniknąć konfliktów
-- (Usuwamy różne warianty nazw, które mogły być utworzone wcześniej)
DROP POLICY IF EXISTS "Public Access PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Public Select PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated All PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Delete PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update PartnersApp" ON storage.objects;

-- 2. POLITYKA: Publiczny Odczyt (Public Select)
-- Każdy (nawet niezalogowany) może wyświetlić/pobrać zdjęcie na stronie.
CREATE POLICY "Public Select PartnersApp"
ON storage.objects FOR SELECT
USING ( bucket_id = 'PartnersApp' );

-- 3. POLITYKA: Publiczny Zapis (Public Insert)
-- Każdy (Wizard/Formularz) może wgrać nowe zdjęcie.
-- Jest to konieczne, aby klienci mogli wysyłać zdjęcia dzieci bez logowania.
CREATE POLICY "Public Insert PartnersApp"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'PartnersApp' );

-- 4. POLITYKA: Administracyjna Edycja i Usuwanie (Authenticated Update/Delete)
-- Tylko zalogowany użytkownik (Ty/Admin/Handlowiec) może podmienić lub usunąć plik.
-- To kluczowe zabezpieczenie: Haker (niezalogowany) nie może wyczyścić Twojego bucketa.

CREATE POLICY "Authenticated Update PartnersApp"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'PartnersApp' AND auth.role() = 'authenticated' )
WITH CHECK ( bucket_id = 'PartnersApp' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated Delete PartnersApp"
ON storage.objects FOR DELETE
USING ( bucket_id = 'PartnersApp' AND auth.role() = 'authenticated' );

COMMIT;
