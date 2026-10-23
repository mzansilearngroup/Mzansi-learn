import { useEffect, useState } from 'react';
import { ArrowLeft, Award, CheckCircle2, BookOpen, ChevronRight, Trophy, Loader2 } from 'lucide-react';
import { supabase, type PracticePaper } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';

export function PaperViewPage({
  paperId,
  navigate,
}: {
  paperId: string;
  navigate: (p: string) => void;
}) {
  const { addPoints, user } = useUser();
  const [paper, setPaper] = useState<PracticePaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [showMemo, setShowMemo] = useState(false);
  const [finished, setFinished] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [savedAnswers, setSavedAnswers] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('practice_papers')
        .select('*')
        .eq('id', paperId)
        .maybeSingle();
      if (data) setPaper(data as PracticePaper);
      setLoading(false);
    })();
  }, [paperId]);

  const question = paper?.questions[currentQ];
  const totalQ = paper?.questions.length ?? 0;
  const progress = totalQ > 0 ? ((currentQ + 1) / totalQ) * 100 : 0;

  const submitAnswer = () => {
    if (!question) return;
    setSubmitted((s) => ({ ...s, [question.id]: true }));
    setShowMemo(true);
    setPointsEarned((p) => p + 5);
    addPoints(5);
  };

  const nextQuestion = () => {
    setShowMemo(false);
    if (currentQ + 1 < totalQ) {
      setCurrentQ(currentQ + 1);
    } else {
      if (user) {
        supabase.from('user_points').insert({
          user_id: user.id,
          grade: paper!.grade,
          subject: paper!.subject,
          score: pointsEarned,
          points_earned: pointsEarned,
        });
      }
      setSavedAnswers(true);
      setFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFD600]" />
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-gray-600 font-semibold mb-4">Paper not found.</p>
        <button onClick={() => navigate('/papers')} className="bg-black text-[#FFD600] font-bold px-6 py-3 rounded-2xl text-sm">
          Back to Papers
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#FFD600] flex items-center justify-center mb-4">
          <Trophy className="w-10 h-10 text-black" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-extrabold mb-2">Paper Complete!</h1>
        <p className="text-gray-600 text-sm mb-1">{paper.title}</p>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 mt-5 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-3xl font-extrabold text-black">{pointsEarned}</div>
              <div className="text-xs text-gray-500 font-semibold">Points Earned</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#FFD600]">{totalQ}</div>
              <div className="text-xs text-gray-500 font-semibold">Questions Done</div>
            </div>
          </div>
        </div>
        {savedAnswers && (
          <p className="text-xs text-green-600 font-bold mb-4">Answers saved to your profile.</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/papers')}
            className="flex-1 bg-black text-[#FFD600] font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
          >
            Back to Papers
          </button>
          <button
            onClick={() => navigate('/leaderboard')}
            className="flex-1 bg-[#FFD600] text-black font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-1.5"
          >
            <Trophy className="w-4 h-4" /> Leaderboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      {/* Header */}
      <button
        onClick={() => navigate('/papers')}
        className="flex items-center gap-1 text-xs font-bold text-gray-500 mb-3 active:scale-95 transition-transform"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Papers
      </button>

      <div className="mb-2">
        <h1 className="text-lg font-extrabold text-black leading-tight">{paper.subject}</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Grade {paper.grade} • {paper.year} • Q {currentQ + 1}/{totalQ}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-[#FFD600] rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="w-8 h-8 rounded-lg bg-black text-[#FFD600] font-extrabold text-sm flex items-center justify-center">
            {currentQ + 1}
          </span>
          <span className="text-xs font-bold bg-[#FFD600]/20 text-[#B8860B] px-2.5 py-1 rounded-full">
            {question?.marks} {question?.marks === 1 ? 'mark' : 'marks'}
          </span>
        </div>
        <p className="text-base font-bold text-black leading-relaxed mb-4">{question?.q}</p>

        {/* Answer area */}
        <textarea
          value={answers[question?.id ?? 0] ?? ''}
          onChange={(e) => {
            if (!question) return;
            setAnswers((a) => ({ ...a, [question.id]: e.target.value }));
          }}
          disabled={submitted[question?.id ?? 0]}
          placeholder="Type your answer here..."
          rows={4}
          className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 bg-gray-50 text-sm focus:border-[#FFD600] focus:outline-none resize-none mb-3 disabled:opacity-60"
        />

        {/* Buttons */}
        <div className="flex gap-2">
          {!submitted[question?.id ?? 0] ? (
            <button
              onClick={submitAnswer}
              className="flex-1 bg-black text-[#FFD600] font-bold text-sm py-3 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Submit Answer
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="flex-1 bg-[#FFD600] text-black font-bold text-sm py-3 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-1.5"
            >
              {currentQ + 1 < totalQ ? 'Next Question' : 'Finish Paper'}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowMemo((s) => !s)}
            disabled={!submitted[question?.id ?? 0]}
            className="px-4 bg-gray-100 text-gray-600 font-bold text-sm py-3 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-1.5 disabled:opacity-30"
          >
            <BookOpen className="w-4 h-4" /> Memo
          </button>
        </div>

        {/* Memo */}
        {showMemo && submitted[question?.id ?? 0] && (
          <div className="mt-4 bg-[#FFD600]/10 border border-[#FFD600]/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Award className="w-4 h-4 text-[#B8860B]" />
              <span className="text-xs font-extrabold text-[#B8860B] uppercase tracking-wide">Memo</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{question?.memo}</p>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-green-600">
              <Award className="w-3.5 h-3.5" /> +5 points earned!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
