
-- 1. Add 'Story' column if it is missing
ALTER TABLE "birthdays"."StoryOrders" ADD COLUMN IF NOT EXISTS "Story" TEXT;

-- 2. Force PostgREST schema cache reload to recognize the new column
NOTIFY pgrst, 'reload config';
