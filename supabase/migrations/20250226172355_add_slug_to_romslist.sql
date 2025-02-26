ALTER TABLE romslist ADD COLUMN IF NOT EXISTS slug text;

CREATE OR REPLACE FUNCTION generate_slug_trigger()
RETURNS trigger AS $$
BEGIN
    IF NEW.slug IS NULL THEN
        NEW.slug := generate_unique_slug(NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_slug
    BEFORE INSERT OR UPDATE ON romslist
    FOR EACH ROW
    EXECUTE FUNCTION generate_slug_trigger();

CREATE OR REPLACE FUNCTION generate_unique_slug(name text) 
RETURNS text AS $$
DECLARE
    base_slug text;
    final_slug text;
    counter integer := 1;
BEGIN
    base_slug := lower(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    
    final_slug := base_slug;
    
    WHILE EXISTS (SELECT 1 FROM romslist WHERE slug = final_slug) LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
    UPDATE romslist 
    SET slug = generate_unique_slug(name)
    WHERE slug IS NULL;
END $$;

ALTER TABLE romslist ALTER COLUMN slug SET NOT NULL;
ALTER TABLE romslist ADD CONSTRAINT romslist_slug_unique UNIQUE (slug);

CREATE INDEX IF NOT EXISTS romslist_slug_idx ON romslist (slug);
