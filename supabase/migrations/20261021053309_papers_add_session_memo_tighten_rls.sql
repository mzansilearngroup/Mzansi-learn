/*
# Papers table: add session + memo_url columns, tighten RLS to read-only public

1. Modified Tables
- `papers`: add `session` text (Nov / May-June), add `memo_url` text (link to memo PDF)
2. Security changes
- DROP all existing anon INSERT/UPDATE/DELETE policies on papers (was open CRUD).
- Keep anon SELECT (public read).
- Admin manages papers via the service role key (bypasses RLS) — no anon write policies.
3. Notes
- This is a non-destructive migration: only adds columns and tightens policies.
*/

ALTER TABLE papers ADD COLUMN IF NOT EXISTS session text;
ALTER TABLE papers ADD COLUMN IF NOT EXISTS memo_url text;

-- Remove write access from anon/authenticated (read-only now)
DROP POLICY IF EXISTS "anon_insert_papers" ON papers;
DROP POLICY IF EXISTS "anon_update_papers" ON papers;
DROP POLICY IF EXISTS "anon_delete_papers" ON papers;

-- Keep public read
DROP POLICY IF EXISTS "anon_select_papers" ON papers;
CREATE POLICY "anon_select_papers" ON papers FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_papers_session ON papers(session);
