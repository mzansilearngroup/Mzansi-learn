import { useEffect, useState } from 'react';
import { FileText, ChevronRight, Loader2, BookOpen } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { supabase, type PracticePaper } from '@/lib/supabase';

const PAPER_SUBJECTS = [
  'Mathematics',
  'Physical Sciences',
  'Life Sciences',
  'English First Additional Language',
  'Mathematical Literacy',
];

const SUBJECT_ICONS: Record<string, string> = {
  Mathematics: 'Calculator',
  'Physical Sciences': 'Atom',
  'Life Sciences': 'Dna',
  'English First Additional Language': 'BookOpen',
  'Mathematical Literacy': 'Calculator',
};

const GRADES = [10, 11, 12];

export function PapersPage({ navigate }: { navigate: (p: string) => void }) {
  const [grade, setGrade] = useState(12);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [papers, setPapers] = useState<PracticePaper[]>([]);
  const [loading, setLoading] = useState(false);

  const getIcon = (subject: string): LucideIcon => {
    const name = SUBJECT_ICONS[subject] ?? 'FileText';
    return (LucideIcons as unknown as Record<string, LucideIcon>)[name] ?? FileText;
  };

  useEffect(() => {
    if (!selectedSubject) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('practice_papers')
        .select('*')
        .eq('grade', grade)
        .eq('subject', selectedSubject)
        .order('created_at', { ascending: false });
      setPapers((data as PracticePaper[]) ?? []);
      setLoading(false);
    })();
  }, [grade, selectedSubject]);

  return (
    <div className="px-4 py-5">
      <h1 className="text-2xl font-extrabold mb-1">Past Papers</h1>
      <p className="text-sm text-gray-600 mb-4">Answer inside the app — earn points</p>

      {/* Grade filter */}
      <div className="mb-4">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Grade</div>
        <div className="flex gap-2">
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => {
                setGrade(g);
                setSelectedSubject(null);
              }}
              className={`flex-1 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                grade === g ? 'bg-blue-600 text-white scale-105' : 'bg-white border-2 border-gray-200 text-gray-600'
              }`}
            >
              Grade {g}
            </button>
          ))}
        </div>
      </div>

      {/* Info box */}
      <div className="flex items-start gap-2 bg-[#FFD600]/10 border border-[#FFD600]/30 rounded-2xl p-3 mb-4">
        <BookOpen className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600 font-medium leading-relaxed">
          Tap a subject to see available papers. Answer questions inside the app and earn 5 points per question.
        </p>
      </div>

      {!selectedSubject ? (
        /* Subject cards */
        <div className="grid grid-cols-2 gap-3">
          {PAPER_SUBJECTS.map((subj) => {
            const Icon = getIcon(subj);
            return (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className="bg-white rounded-3xl p-4 min-h-[120px] flex flex-col justify-between text-left active:scale-95 transition-transform shadow-sm border border-gray-100"
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-[#FFD600]">
                  <Icon className="w-6 h-6 text-black" strokeWidth={2} />
                </div>
                <div>
                  <div className="font-extrabold text-sm leading-tight">{subj}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Grade {grade}</div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Paper list for selected subject */
        <div>
          <button
            onClick={() => setSelectedSubject(null)}
            className="text-xs font-bold text-gray-500 mb-3 active:scale-95 transition-transform"
          >
            ← All subjects
          </button>

          <div className="flex items-center gap-2 mb-4">
            {(() => {
              const Icon = getIcon(selectedSubject);
              return (
                <div className="w-10 h-10 rounded-xl bg-[#FFD600] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-black" strokeWidth={2} />
                </div>
              );
            })()}
            <div>
              <h2 className="font-extrabold text-sm text-black">{selectedSubject}</h2>
              <p className="text-[10px] text-gray-400">Grade {grade}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-7 h-7 animate-spin text-[#FFD600]" />
            </div>
          ) : papers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 font-semibold text-sm mb-3">No papers available for this subject yet.</p>
              <button
                onClick={() => navigate('/request-paper')}
                className="bg-[#FFD600] text-black font-bold px-5 py-2.5 rounded-xl text-xs active:scale-95 transition-transform"
              >
                Request a Paper
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {papers.map((p) => {
                const totalMarks = p.questions.reduce((s, q) => s + q.marks, 0);
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3"
                  >
                    <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-[#FFD600]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-black truncate">{p.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {p.questions.length} Questions
                        </span>
                        <span className="text-[10px] font-bold bg-[#FFD600]/20 text-[#B8860B] px-2 py-0.5 rounded-full">
                          {totalMarks} marks
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/papers/${p.id}`)}
                      className="bg-[#FFD600] text-black font-bold text-xs px-4 py-2.5 rounded-xl active:scale-95 transition-transform flex items-center gap-1 shrink-0"
                    >
                      Start Paper <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer note */}
      <div className="mt-6 text-center">
        <p className="text-[11px] text-gray-400 font-medium">
          Papers sourced from DBE Official, adapted for practice
        </p>
      </div>
    </div>
  );
}
