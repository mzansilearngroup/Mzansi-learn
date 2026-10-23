import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export type User = {
  id: string;
  name: string;
  grade: number;
  school?: string | null;
  phone?: string | null;
  points: number;
  avatar?: string | null;
  created_at?: string;
};

export type Paper = {
  id: string;
  grade: number;
  year: number;
  subject: string;
  paper_type: string;
  session?: string | null;
  pdf_url?: string | null;
  memo_url?: string | null;
  views: number;
  created_at?: string;
};

export type PracticeQuestion = {
  id: number;
  q: string;
  marks: number;
  memo: string;
  type: string;
};

export type PracticePaper = {
  id: string;
  grade: number;
  subject: string;
  year: string;
  title: string;
  questions: PracticeQuestion[];
  created_at?: string;
};

export type QuizQuestion = {
  id: string;
  grade: number;
  subject: string;
  topic: string;
  question: string;
  options: string[];
  correct_answer: number;
};

export type UserPoint = {
  id: string;
  user_id?: string | null;
  grade: number;
  subject: string;
  score: number;
  points_earned: number;
  created_at?: string;
};

export type PaperRequest = {
  id: string;
  grade: number;
  subject: string;
  year: number;
  paper_type: string;
  reason?: string | null;
  phone?: string | null;
  status: string;
  request_count: number;
  created_at?: string;
};
