
-- Add new JSON columns to Stories table
ALTER TABLE "PartnersApp"."Stories" 
ADD COLUMN IF NOT EXISTS "DynamicLines" JSONB,
ADD COLUMN IF NOT EXISTS "Scenario" JSONB;
