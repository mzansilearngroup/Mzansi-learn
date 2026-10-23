/*
# Create practice_papers table with embedded questions

1. New Table
- `practice_papers`: id, grade, subject, year, title, questions (jsonb array of {id, q, marks, memo, type})
2. Security
- RLS enabled, public read for anon + authenticated (no-auth app)
- No write policies — admin manages via service role
3. Notes
- Separate from the old `papers` table (which linked to external PDFs)
- Questions are embedded as jsonb so learners answer inside the app
*/

CREATE TABLE IF NOT EXISTS practice_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade int NOT NULL,
  subject text NOT NULL,
  year text NOT NULL,
  title text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE practice_papers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_practice_papers" ON practice_papers;
CREATE POLICY "anon_select_practice_papers" ON practice_papers
  FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_practice_papers_grade_subject ON practice_papers(grade, subject);
