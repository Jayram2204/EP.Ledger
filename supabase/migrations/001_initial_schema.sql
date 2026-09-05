-- Function to validate each element in the moments array
-- Required because PostgreSQL does not allow subqueries in CHECK constraints
CREATE OR REPLACE FUNCTION moments_within_length(arr TEXT[], max_len INT)
RETURNS BOOLEAN AS $$
DECLARE
  m TEXT;
BEGIN
  FOREACH m IN ARRAY arr LOOP
    IF char_length(m) > max_len THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  moments TEXT[] NOT NULL,
  token_url TEXT,
  token_fallback BOOLEAN DEFAULT FALSE,
  sealed BOOLEAN DEFAULT FALSE,
  sealed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_daily_entry UNIQUE (user_id, entry_date),
  CONSTRAINT moments_length_check CHECK (
    array_length(moments, 1) = 3 AND
    moments_within_length(moments, 80)
  )
);

ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own entries" 
ON entries FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own entries" 
ON entries FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());
