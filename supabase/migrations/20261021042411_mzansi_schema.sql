/*
# Mzansi Learn & Earn — full schema

1. New Tables
- `users` — learner profiles (id, name, grade, school, phone, points, avatar, created_at)
- `papers` — past papers catalog (id, grade, year, subject, paper_type, pdf_url, views, created_at)
- `quiz_questions` — quiz bank (id, grade, subject, topic, question, options jsonb, correct_answer, created_at)
- `user_points` — quiz attempt results (id, user_id, grade, subject, score, points_earned, created_at)
- `paper_requests` — learner requests for missing papers (id, grade, subject, year, paper_type, reason, phone, status, request_count, created_at)

2. Security
- This app has NO sign-in screen (phone is stored in localStorage, no OTP). All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)` because the data is intentionally public/shared across all learners.
- RLS enabled on every table.

3. Notes
- `users.phone` is the de-facto identifier (no auth). Frontend matches user rows by phone.
- `quiz_questions.options` is a JSONB array of 4 strings (A-D), `correct_answer` is 0-3 index.
- `paper_requests.request_count` lets multiple learners bump the same request; frontend upserts by (grade,subject,year,paper_type).
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Learner',
  grade int NOT NULL DEFAULT 10,
  school text,
  phone text UNIQUE,
  points int NOT NULL DEFAULT 0,
  avatar text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade int NOT NULL,
  year int NOT NULL,
  subject text NOT NULL,
  paper_type text NOT NULL,
  pdf_url text,
  views int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade int NOT NULL,
  subject text NOT NULL,
  topic text NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer int NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  grade int NOT NULL,
  subject text NOT NULL,
  score int NOT NULL DEFAULT 0,
  points_earned int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS paper_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade int NOT NULL,
  subject text NOT NULL,
  year int NOT NULL,
  paper_type text NOT NULL,
  reason text,
  phone text,
  status text NOT NULL DEFAULT 'pending',
  request_count int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_requests ENABLE ROW LEVEL SECURITY;

-- users: public CRUD (no-auth app, phone-based identity)
DROP POLICY IF EXISTS "anon_select_users" ON users;
CREATE POLICY "anon_select_users" ON users FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_users" ON users;
CREATE POLICY "anon_insert_users" ON users FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_users" ON users;
CREATE POLICY "anon_update_users" ON users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_users" ON users;
CREATE POLICY "anon_delete_users" ON users FOR DELETE TO anon, authenticated USING (true);

-- papers: public CRUD
DROP POLICY IF EXISTS "anon_select_papers" ON papers;
CREATE POLICY "anon_select_papers" ON papers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_papers" ON papers;
CREATE POLICY "anon_insert_papers" ON papers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_papers" ON papers;
CREATE POLICY "anon_update_papers" ON papers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_papers" ON papers;
CREATE POLICY "anon_delete_papers" ON papers FOR DELETE TO anon, authenticated USING (true);

-- quiz_questions: public CRUD
DROP POLICY IF EXISTS "anon_select_quiz" ON quiz_questions;
CREATE POLICY "anon_select_quiz" ON quiz_questions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_quiz" ON quiz_questions;
CREATE POLICY "anon_insert_quiz" ON quiz_questions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_quiz" ON quiz_questions;
CREATE POLICY "anon_update_quiz" ON quiz_questions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_quiz" ON quiz_questions;
CREATE POLICY "anon_delete_quiz" ON quiz_questions FOR DELETE TO anon, authenticated USING (true);

-- user_points: public CRUD
DROP POLICY IF EXISTS "anon_select_user_points" ON user_points;
CREATE POLICY "anon_select_user_points" ON user_points FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_user_points" ON user_points;
CREATE POLICY "anon_insert_user_points" ON user_points FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_user_points" ON user_points;
CREATE POLICY "anon_update_user_points" ON user_points FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_user_points" ON user_points;
CREATE POLICY "anon_delete_user_points" ON user_points FOR DELETE TO anon, authenticated USING (true);

-- paper_requests: public CRUD
DROP POLICY IF EXISTS "anon_select_paper_requests" ON paper_requests;
CREATE POLICY "anon_select_paper_requests" ON paper_requests FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_paper_requests" ON paper_requests;
CREATE POLICY "anon_insert_paper_requests" ON paper_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_paper_requests" ON paper_requests;
CREATE POLICY "anon_update_paper_requests" ON paper_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_paper_requests" ON paper_requests;
CREATE POLICY "anon_delete_paper_requests" ON paper_requests FOR DELETE TO anon, authenticated USING (true);

-- Indexes for common filters
CREATE INDEX IF NOT EXISTS idx_papers_grade_year_subject ON papers(grade, year, subject);
CREATE INDEX IF NOT EXISTS idx_quiz_grade_subject ON quiz_questions(grade, subject);
CREATE INDEX IF NOT EXISTS idx_user_points_user ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_requests_group ON paper_requests(grade, subject, year, paper_type);
CREATE INDEX IF NOT EXISTS idx_users_points ON users(points DESC);
