
BEGIN;

-- 1. Usuwamy starą politykę "Public Update Orders" którą stworzyliśmy wcześniej
DROP POLICY IF EXISTS "Public Update Orders" ON "birthdays"."StoryOrders";
DROP POLICY IF EXISTS "Enable all access for all users" ON "birthdays"."StoryOrders";

-- 2. Upewniamy się, że INSERT jest dozwolony (Atomic Save tego wymaga)
DROP POLICY IF EXISTS "Public Insert Orders" ON "birthdays"."StoryOrders";
CREATE POLICY "Public Insert Orders" ON "birthdays"."StoryOrders" 
FOR INSERT WITH CHECK (true);

-- 3. Upewniamy się, że SELECT jest zablokowany dla anonimów (tylko Admin/Zalogowany widzi listę)
DROP POLICY IF EXISTS "Admin Read Orders" ON "birthdays"."StoryOrders";
CREATE POLICY "Admin Read Orders" ON "birthdays"."StoryOrders" 
FOR SELECT USING (auth.role() = 'authenticated');

-- Wniosek: Teraz anonim może TYLKO dodać rekord. Nie może go edytować ani usunąć.
-- Jeśli popełni błąd w Wizardzie i cofnie się - stworzy po prostu nowy rekord (to bezpieczniejsze).

COMMIT;
