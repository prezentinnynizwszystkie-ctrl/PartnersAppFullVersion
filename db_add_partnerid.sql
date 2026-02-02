
-- 1. Add 'PartnerId' column to link with PartnersApp.Partners(Id)
ALTER TABLE "birthdays"."StoryOrders" ADD COLUMN IF NOT EXISTS "PartnerId" INTEGER;

-- 2. Force PostgREST schema cache reload
NOTIFY pgrst, 'reload config';
