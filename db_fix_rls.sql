
-- 1. Ensure the schema and table exist (safety check)
CREATE SCHEMA IF NOT EXISTS "birthdays";
CREATE TABLE IF NOT EXISTS "birthdays"."StoryOrders" (
    "OrderId" SERIAL PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "mail_marketing" TEXT,
    "Story" TEXT,
    "Questionnaire" JSONB,
    "Status" TEXT DEFAULT 'QuestionnaireToApprove',
    "PhotoUrl" TEXT,
    "PhotoUrl1" TEXT,
    "RecordUrl" TEXT
);

-- 2. ENABLE Row Level Security explicitly
-- This ensures that policies are actually checked.
ALTER TABLE "birthdays"."StoryOrders" ENABLE ROW LEVEL SECURITY;

-- 3. Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable all access for all users" ON "birthdays"."StoryOrders";
DROP POLICY IF EXISTS "Public Access StoryOrders" ON "birthdays"."StoryOrders";

-- 4. Create a permissive policy
-- "FOR ALL" allows SELECT, INSERT, UPDATE, DELETE
-- "USING (true)" allows seeing all rows
-- "WITH CHECK (true)" allows inserting/updating any rows
CREATE POLICY "Enable all access for all users"
ON "birthdays"."StoryOrders"
FOR ALL
USING (true)
WITH CHECK (true);

-- 5. Grant necessary permissions to the 'anon' role (public users)
GRANT USAGE ON SCHEMA "birthdays" TO anon, authenticated, service_role;
GRANT ALL ON TABLE "birthdays"."StoryOrders" TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "birthdays" TO anon, authenticated, service_role;
