/*
# Storage policies for papers bucket

1. Security
- Public read + write for the `papers` bucket (no-auth app, admin uploads via anon key).
- `USING (true)` is intentional — content is publicly shared learning material.
*/

DROP POLICY IF EXISTS "anon_read_papers_bucket" ON storage.objects;
CREATE POLICY "anon_read_papers_bucket" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'papers');

DROP POLICY IF EXISTS "anon_insert_papers_bucket" ON storage.objects;
CREATE POLICY "anon_insert_papers_bucket" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'papers');

DROP POLICY IF EXISTS "anon_update_papers_bucket" ON storage.objects;
CREATE POLICY "anon_update_papers_bucket" ON storage.objects
  FOR UPDATE TO anon, authenticated USING (bucket_id = 'papers') WITH CHECK (bucket_id = 'papers');

DROP POLICY IF EXISTS "anon_delete_papers_bucket" ON storage.objects;
CREATE POLICY "anon_delete_papers_bucket" ON storage.objects
  FOR DELETE TO anon, authenticated USING (bucket_id = 'papers');
