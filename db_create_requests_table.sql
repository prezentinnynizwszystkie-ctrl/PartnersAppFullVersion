
-- 1. Tworzymy tabelę zgłoszeń
CREATE TABLE IF NOT EXISTS "PartnersApp"."PartnerRequests" (
    "id" SERIAL PRIMARY KEY,
    "partner_id" INTEGER REFERENCES "PartnersApp"."Partners"("Id"),
    "request_type" TEXT NOT NULL, -- np. 'Sekcja Hero', 'Ceny'
    "description" TEXT NOT NULL,
    "status" TEXT DEFAULT 'OCZEKUJE', -- OCZEKUJE, W_TRAKCIE, ZROBIONE
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Włączamy RLS
ALTER TABLE "PartnersApp"."PartnerRequests" ENABLE ROW LEVEL SECURITY;

-- 3. Uprawnienia (Granty)
GRANT ALL ON "PartnersApp"."PartnerRequests" TO authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE "PartnersApp"."PartnerRequests_id_seq" TO authenticated, service_role;

-- 4. POLITYKI BEZPIECZEŃSTWA (RLS)

-- Polityka A: Partnerzy mogą widzieć TYLKO swoje zgłoszenia. Admini i Handlowcy widzą wszystkie.
CREATE POLICY "Access Requests Policy" ON "PartnersApp"."PartnerRequests"
FOR SELECT
USING (
    -- Jeśli user jest właścicielem zgłoszenia (poprzez powiązanego partnera)
    (partner_id IN (
        SELECT partner_id FROM "PartnersApp"."Profiles" WHERE id = auth.uid()
    ))
    OR
    -- Lub jeśli user jest Adminem/Handlowcem
    (EXISTS (
        SELECT 1 FROM "PartnersApp"."Profiles" 
        WHERE id = auth.uid() 
        AND role IN ('ADMIN'::"PartnersApp"."app_role", 'HANDLOWIEC'::"PartnersApp"."app_role")
    ))
);

-- Polityka B: Partnerzy mogą DODAWAĆ zgłoszenia (tylko dla siebie)
CREATE POLICY "Partners Insert Requests" ON "PartnersApp"."PartnerRequests"
FOR INSERT
WITH CHECK (
    -- Sprawdzamy, czy partner_id w nowym wierszu zgadza się z partner_id usera
    partner_id IN (
        SELECT partner_id FROM "PartnersApp"."Profiles" WHERE id = auth.uid()
    )
    -- Opcjonalnie pozwalamy Adminom dodawać za kogoś
    OR 
    (EXISTS (
        SELECT 1 FROM "PartnersApp"."Profiles" 
        WHERE id = auth.uid() 
        AND role = 'ADMIN'::"PartnersApp"."app_role"
    ))
);
