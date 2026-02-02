
-- 1. Tworzymy typ wyliczeniowy (ENUM) - to on da Ci "listę wyboru" w Supabase
-- Jeśli typ już istnieje, nic nie robimy (dla bezpieczeństwa przy wielokrotnym uruchamianiu)
DO $$ BEGIN
    CREATE TYPE "PartnersApp"."app_role" AS ENUM ('ADMIN', 'HANDLOWIEC', 'PARTNER', 'KLIENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Czyszczenie danych przed zmianą typu (żeby nie było błędów migracji)
-- Zamieniamy wszystko na duże litery (np. 'admin' -> 'ADMIN')
UPDATE "PartnersApp"."Profiles"
SET role = UPPER(role);

-- Jeśli ktoś ma wpisane coś dziwnego (spoza listy), zmieniamy go na 'KLIENT'
UPDATE "PartnersApp"."Profiles"
SET role = 'KLIENT'
WHERE role NOT IN ('ADMIN', 'HANDLOWIEC', 'PARTNER', 'KLIENT');

-- 3. Usuwamy stare zabezpieczenie (Check Constraint), bo ENUM jest lepszy
ALTER TABLE "PartnersApp"."Profiles"
DROP CONSTRAINT IF EXISTS "Profiles_role_check";

-- 4. Zmieniamy typ kolumny z TEXT na nasz nowy ENUM
-- Klauzula USING mówi bazie: "potraktuj obecny tekst jako element z listy"
ALTER TABLE "PartnersApp"."Profiles"
ALTER COLUMN "role" TYPE "PartnersApp"."app_role"
USING role::"PartnersApp"."app_role";

-- 5. Ustawiamy domyślną wartość na przyszłość
ALTER TABLE "PartnersApp"."Profiles"
ALTER COLUMN "role" SET DEFAULT 'KLIENT';
