
-- 1. Funkcja, która uruchomi się AUTOMATYCZNIE przy każdej rejestracji (Sign Up)
CREATE OR REPLACE FUNCTION "PartnersApp"."handle_new_user"() 
RETURNS TRIGGER AS $$
BEGIN
  -- A. Sprawdź, czy ten email należy do HANDLOWCA
  IF EXISTS (SELECT 1 FROM "PartnersApp"."Handlowcy" WHERE email = NEW.email) THEN
     INSERT INTO "PartnersApp"."Profiles" (id, email, role, handlowiec_id)
     SELECT NEW.id, NEW.email, 'HANDLOWIEC', id
     FROM "PartnersApp"."Handlowcy" WHERE email = NEW.email
     ON CONFLICT (id) DO UPDATE SET role = 'HANDLOWIEC', handlowiec_id = EXCLUDED.handlowiec_id;
     RETURN NEW;
  END IF;

  -- B. Sprawdź, czy ten email należy do PARTNERA (dodanego przez Handlowca)
  IF EXISTS (SELECT 1 FROM "PartnersApp"."Partners" WHERE contact_email = NEW.email) THEN
     INSERT INTO "PartnersApp"."Profiles" (id, email, role, partner_id)
     SELECT NEW.id, NEW.email, 'PARTNER', "Id"
     FROM "PartnersApp"."Partners" WHERE contact_email = NEW.email
     ON CONFLICT (id) DO UPDATE SET role = 'PARTNER', partner_id = EXCLUDED.partner_id;
     RETURN NEW;
  END IF;

  -- C. Jeśli nikogo nie znaleziono -> to zwykły KLIENT
  INSERT INTO "PartnersApp"."Profiles" (id, email, role)
  VALUES (NEW.id, NEW.email, 'KLIENT')
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Podpięcie funkcji pod tabelę użytkowników Supabase (auth.users)
-- Najpierw usuwamy stary trigger, jeśli istnieje, żeby nie dublować
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION "PartnersApp"."handle_new_user"();
