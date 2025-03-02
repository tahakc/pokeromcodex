CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rom_id INTEGER NOT NULL REFERENCES romslist(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, rom_id)
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own collections" 
  ON collections FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections" 
  ON collections FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" 
  ON collections FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" 
  ON collections FOR DELETE 
  USING (auth.uid() = user_id);

CREATE INDEX collections_user_id_idx ON collections(user_id);
CREATE INDEX collections_rom_id_idx ON collections(rom_id);
