CREATE TABLE IF NOT EXISTS user_identity_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  linked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(primary_user_id, linked_user_id)
);

ALTER TABLE user_identity_map ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own identity mappings
CREATE POLICY "Users can view their own identity mappings" 
  ON user_identity_map FOR SELECT 
  USING (auth.uid() = primary_user_id OR auth.uid() = linked_user_id);

-- Only the system can insert/update identity mappings
CREATE POLICY "System can manage identity mappings" 
  ON user_identity_map FOR ALL 
  USING (auth.role() = 'service_role');

-- Create indexes for faster lookups
CREATE INDEX user_identity_map_primary_user_id_idx ON user_identity_map(primary_user_id);
CREATE INDEX user_identity_map_linked_user_id_idx ON user_identity_map(linked_user_id);
