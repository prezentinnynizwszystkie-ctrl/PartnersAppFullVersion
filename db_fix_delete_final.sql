
-- SKRYPT ATOMOWY: Naprawa usuwania wpisów z tabeli Stories
-- Wykonaj ten skrypt w Supabase SQL Editor

-- 1. Wyłączamy Row Level Security (RLS) całkowicie dla tej tabeli
-- To eliminuje wszelkie "ukryte" polityki blokujące usuwanie.
ALTER TABLE "PartnersApp"."Stories" DISABLE ROW LEVEL SECURITY;

-- 2. Nadajemy PEŁNE uprawnienia (SELECT, INSERT, UPDATE, DELETE) dla wszystkich ról
-- 'anon' - dla niezalogowanych (jeśli testujesz bez logowania)
-- 'authenticated' - dla zalogowanych
-- 'service_role' - dla operacji systemowych
GRANT ALL ON TABLE "PartnersApp"."Stories" TO anon, authenticated, service_role;

-- 3. Nadajemy uprawnienia do sekwencji (żeby można było dodawać nowe z auto-inkrementacją)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "PartnersApp" TO anon, authenticated, service_role;

-- 4. Upewniamy się, że schemat jest dostępny
GRANT USAGE ON SCHEMA "PartnersApp" TO anon, authenticated, service_role;

-- 5. Odświeżamy cache API
NOTIFY pgrst, 'reload config';
