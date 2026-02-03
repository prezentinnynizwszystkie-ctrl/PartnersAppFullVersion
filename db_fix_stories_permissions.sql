
-- SKRYPT NAPRAWCZY: Uprawnienia do tabeli Stories
-- Rozwiązuje błąd: permission denied for table Stories (42501)

-- 1. Nadanie uprawnień do modyfikacji danych (INSERT, UPDATE, DELETE) dla zalogowanych użytkowników (authenticated)
-- oraz dla roli serwisowej (service_role).
GRANT INSERT, UPDATE, DELETE ON TABLE "PartnersApp"."Stories" TO authenticated, service_role;

-- 2. Nadanie uprawnień do sekwencji (niezbędne, aby baza mogła generować kolejne ID dla nowych bajek)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "PartnersApp" TO authenticated, service_role;

-- 3. Upewnienie się, że RLS (Row Level Security) jest wyłączone dla tej tabeli (dla uproszczenia dostępu w panelu Admina)
ALTER TABLE "PartnersApp"."Stories" DISABLE ROW LEVEL SECURITY;

-- 4. Odświeżenie cache API (PostgREST), aby zmiany weszły w życie natychmiast
NOTIFY pgrst, 'reload config';
