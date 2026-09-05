-- Create the private "tokens" bucket
-- Adding ON CONFLICT DO NOTHING makes this migration idempotent
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tokens', 'tokens', false)
ON CONFLICT (id) DO NOTHING;



-- Restrict SELECT to files where the path prefix matches the user's uid
CREATE POLICY "Users can view their own tokens"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'tokens' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Restrict INSERT to files where the path prefix matches the user's uid
CREATE POLICY "Users can upload their own tokens"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tokens' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
