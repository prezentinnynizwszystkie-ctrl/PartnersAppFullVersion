
-- 1. Add 'StoryId' column to link with PartnersApp.Stories(Id)
ALTER TABLE "birthdays"."StoryOrders" ADD COLUMN IF NOT EXISTS "StoryId" INTEGER;

-- 2. Force PostgREST schema cache reload
NOTIFY pgrst, 'reload config';
