
BEGIN;

-- 1. Usuń starą, luźną politykę INSERT (która pozwalała na wszystko)
DROP POLICY IF EXISTS "Public Insert Orders" ON "birthdays"."StoryOrders";

-- 2. Stwórz nową, bezpieczną politykę INSERT
-- Pozwala wstawić rekord TYLKO JEŚLI podany w formularzu "PartnerId"
-- istnieje w tabeli Partners ORAZ ma Status = 'AKTYWNY'.
-- Jeśli haker spróbuje wysłać zamówienie z ID nieaktywnego partnera, baza odrzuci to jako "new row violates row-level security policy".

CREATE POLICY "Public Insert Orders" ON "birthdays"."StoryOrders"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM "PartnersApp"."Partners"
    WHERE "Id" = "PartnerId"
    AND "Status" = 'AKTYWNY'
  )
);

COMMIT;
