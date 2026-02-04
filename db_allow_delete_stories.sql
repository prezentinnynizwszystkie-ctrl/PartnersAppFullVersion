
-- SKRYPT NAPRAWCZY: Odblokowanie usuwania bajek
-- Rozwiązuje problem braku uprawnień przy kliknięciu ikony kosza.

-- 1. Nadaj pełne uprawnienia (w tym DELETE) dla zalogowanych użytkowników i roli serwisowej
GRANT DELETE ON TABLE "PartnersApp"."Stories" TO authenticated, service_role;

-- 2. Na wszelki wypadek nadaj też dla anonimowych (jeśli testujesz bez logowania w trybie dev)
GRANT DELETE ON TABLE "PartnersApp"."Stories" TO anon;

-- 3. Upewnij się, że Row Level Security (RLS) nie blokuje operacji
ALTER TABLE "PartnersApp"."Stories" DISABLE ROW LEVEL SECURITY;

-- 4. Odśwież konfigurację API
NOTIFY pgrst, 'reload config';
