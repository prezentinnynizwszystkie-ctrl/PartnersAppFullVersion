
-- 1. MODYFIKACJA TABELI PARTNERS
-- Dodajemy kolumnę 'contact_email', żeby łatwiej było zarządzać firmami i je parować
ALTER TABLE "PartnersApp"."Partners"
ADD COLUMN IF NOT EXISTS "contact_email" TEXT;

-- 2. CZYSZCZENIE: Usuwamy stare kolumny z Handlowcy (cleanup)
ALTER TABLE "PartnersApp"."Handlowcy"
DROP COLUMN IF EXISTS "login",
DROP COLUMN IF EXISTS "haslo";

-- 3. DANE: Upewniamy się, że Handlowcy istnieją
INSERT INTO "PartnersApp"."Handlowcy" ("id", "imie", "nazwisko", "telefon", "email")
VALUES 
(1, 'Piotr', 'Mazurkiewicz', '+48 693 374 300', 'piotr@prezentinnynizwszystkie.pl'),
(2, 'Grzegorz', 'Rabczak', '501031430', 'grzegorz@prezentinnynizwszystkie.pl')
ON CONFLICT ("id") DO UPDATE SET "email" = EXCLUDED."email";

-- 4. DANE: Upewniamy się, że Partnerzy istnieją i mają przypisane EMAILE KONTAKTOWE
-- To jest kluczowe dla Twojego pytania - teraz Partner ma przypisany email w swojej tabeli biznesowej.
INSERT INTO "PartnersApp"."Partners" ("PartnerType", "PartnerName", "IdOpiekuna", "Status", "Model", "Slug", "LogoUrl", "contact_email")
VALUES 
('Sala Zabaw', 'Fikolandia', 1, 'AKTYWNY', 'PROWIZJA', 'fikolandia', 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png', 'fikolandia@demo.pl'),
('Park Rozrywki', 'DinoPark', 2, 'AKTYWNY', 'PAKIET', 'dinopark', 'https://cdn-icons-png.flaticon.com/512/2313/2313469.png', 'dinopark@demo.pl'),
('Centrum Nauki', 'AstroPlaneta', 1, 'AKTYWNY', 'PROWIZJA', 'astro', 'https://cdn-icons-png.flaticon.com/512/3212/3212567.png', 'astro@demo.pl'),
('Sala Zabaw', 'Nibylandia', 1, 'AKTYWNY', 'PROWIZJA', 'nibylandia', 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png', 'nibylandia@demo.pl')
ON CONFLICT ("Slug") DO UPDATE SET "contact_email" = EXCLUDED."contact_email";


-- 5. MOST (Profiles): Łączenie Auth (Logowanie) z Partners (Biznes)
-- Teraz logika jest prosta: Jeśli user ma maila X, i partner ma maila X -> połącz ich.

-- A. Łączenie Handlowców
INSERT INTO "PartnersApp"."Profiles" (id, email, role, handlowiec_id)
SELECT auth.users.id, auth.users.email, 'HANDLOWIEC', "PartnersApp"."Handlowcy".id
FROM auth.users
JOIN "PartnersApp"."Handlowcy" ON auth.users.email = "PartnersApp"."Handlowcy".email
ON CONFLICT (id) DO UPDATE SET role = 'HANDLOWIEC', handlowiec_id = EXCLUDED.handlowiec_id;

-- B. Łączenie Partnerów
INSERT INTO "PartnersApp"."Profiles" (id, email, role, partner_id)
SELECT auth.users.id, auth.users.email, 'PARTNER', "PartnersApp"."Partners"."Id"
FROM auth.users
JOIN "PartnersApp"."Partners" ON auth.users.email = "PartnersApp"."Partners"."contact_email"
ON CONFLICT (id) DO UPDATE SET role = 'PARTNER', partner_id = EXCLUDED.partner_id;

-- C. Nadanie Admina (opcjonalnie, jeśli masz usera o takim mailu)
-- UPDATE "PartnersApp"."Profiles" SET role = 'ADMIN' WHERE email = 'twoj_admin_mail@gmail.com';
