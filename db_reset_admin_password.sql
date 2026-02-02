
-- SKRYPT RESETOWANIA HASŁA
-- Uruchom ten skrypt w Supabase SQL Editor, aby zmienić hasło na 'admin'

-- 1. Włączamy rozszerzenie pgcrypto (potrzebne do szyfrowania hasła algorytmem bcrypt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Aktualizujemy hasło dla wszystkich użytkowników, którzy mają rolę ADMIN w Profiles
UPDATE auth.users
SET encrypted_password = crypt('admin', gen_salt('bf'))
WHERE id IN (
    SELECT id 
    FROM "PartnersApp"."Profiles" 
    WHERE role = 'ADMIN'::"PartnersApp"."app_role"
);

-- UWAGA: Jeśli po uruchomieniu tego skryptu nadal nie możesz się zalogować, 
-- oznacza to, że Twój użytkownik nie ma jeszcze poprawnie przypisanej roli ADMIN w tabeli Profiles.
-- W takim przypadku użyj poniższego zapytania (odkomentuj je usuwając kreski), wpisując swój e-mail:

-- UPDATE auth.users 
-- SET encrypted_password = crypt('admin', gen_salt('bf')) 
-- WHERE email = 'TWOJ_EMAIL@DOMENA.PL';
