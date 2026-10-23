/*
# Create subject_requests table

1. New Tables
- `subject_requests` — learners request new subjects to be added (id, subject_name, reason, phone, status, request_count, created_at)
2. Security
- No-auth app: public CRUD with anon + authenticated, data intentionally shared.
*/

CREATE TABLE IF NOT EXISTS subject_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_name text NOT NULL,
  reason text,
  phone text,
  status text NOT NULL DEFAULT 'pending',
  request_count int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subject_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_subject_requests" ON subject_requests;
CREATE POLICY "anon_select_subject_requests" ON subject_requests FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_subject_requests" ON subject_requests;
CREATE POLICY "anon_insert_subject_requests" ON subject_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_subject_requests" ON subject_requests;
CREATE POLICY "anon_update_subject_requests" ON subject_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_subject_requests" ON subject_requests;
CREATE POLICY "anon_delete_subject_requests" ON subject_requests FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_subject_requests_name ON subject_requests(subject_name);
