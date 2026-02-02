
-- 1. Nadanie uprawnień systemowych do schematu PartnersApp
-- To jest kluczowe: 'supabase_auth_admin' to rola, która wykonuje operacje w panelu Authentication.
GRANT USAGE ON SCHEMA "PartnersApp" TO service_role, supabase_auth_admin, postgres, authenticated, anon;

-- 2. Nadanie uprawnień do tabel dla ról systemowych
GRANT ALL ON ALL TABLES IN SCHEMA "PartnersApp" TO service_role, supabase_auth_admin, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA "PartnersApp" TO service_role, supabase_auth_admin, postgres;

-- 3. Dodanie polityki INSERT dla tabeli Profiles
-- Mimo że trigger działa jako administrator, RLS (Row Level Security) czasami blokuje inserty.
-- Ta polityka mówi: "Pozwól systemowi (i triggerom) dodawać nowe wiersze do Profiles".
DROP POLICY IF EXISTS "Enable Insert for Auth System" ON "PartnersApp"."Profiles";

CREATE POLICY "Enable Insert for Auth System" ON "PartnersApp"."Profiles"
FOR INSERT
WITH CHECK (true); 

-- 4. Upewnienie się, że funkcja triggera jest dostępna
GRANT EXECUTE ON FUNCTION "PartnersApp"."handle_new_user"() TO service_role, supabase_auth_admin, postgres, authenticated, anon;

-- 5. Ostateczne upewnienie się, że RLS nie blokuje Handlowców (jeśli trigger ich sprawdza)
-- Ponieważ trigger czyta Handlowców, upewnijmy się, że ma do tego prawo.
ALTER TABLE "PartnersApp"."Handlowcy" DISABLE ROW LEVEL SECURITY; 
-- (Zostawiamy wyłączone dla Handlowców dla prostoty, bo to tabela publiczna w Twoim modelu)
