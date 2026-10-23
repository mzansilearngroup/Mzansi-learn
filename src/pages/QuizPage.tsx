import { useEffect, useMemo, useState } from 'react';
import { Brain, Clock, CheckCircle2, XCircle, PartyPopper, RotateCcw, ChevronRight } from 'lucide-react';
import { supabase, type QuizQuestion } from '@/lib/supabase';
import { SUBJECTS, GRADES } from '@/lib/constants';
import { useUser } from '@/context/UserContext';

type Stage = 'setup' | 'quiz' | 'done';

export function QuizPage() {
  const { profile, addPoints } = useUser();
  const [stage, setStage] = useState<Stage>('setup');
  const [grade, setGrade] = useState<number>(profile?.grade ?? 10);
  const [subject, setSubject] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [topics, setTopics] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const gradeQuestions = useMemo(() => questions, [questions]);

  // Load topics when subject changes
  useEffect(() => {
    if (!subject) {
      setTopics([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('quiz_questions')
        .select('topic')
        .eq('grade', grade)
        .eq('subject', subject);
      const unique = Array.from(new Set((data ?? []).map((d: { topic: string }) => d.topic)));
      setTopics(unique);
      setTopic('');
    })();
  }, [grade, subject]);

  // Timer
  useEffect(() => {
    if (stage !== 'quiz') return;
    if (timeLeft <= 0) {
      finishQuiz();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, timeLeft]);

  const startQuiz = async () => {
    if (!subject) return;
    setLoading(true);
    let query = supabase.from('quiz_questions').select('*').eq('grade', grade).eq('subject', subject);
    if (topic) query = query.eq('topic', topic);
    const { data } = await query.limit(10);
    setLoading(false);
    if (!data || data.length === 0) {
      // No questions — use fallback local questions
      const fallback = generateFallback(grade, subject);
      setQuestions(fallback);
    } else {
      setQuestions(data as QuizQuestion[]);
    }
    setStage('quiz');
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setTimeLeft(600);
  };

  const nextQuestion = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);
    if (current + 1 < gradeQuestions.length) {
      setCurrent(current + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = (allAnswers?: number[]) => {
    const ans = allAnswers ?? answers;
    let correct = 0;
    gradeQuestions.forEach((q, i) => {
      if (ans[i] === q.correct_answer) correct++;
    });
    const earned = correct * 10;
    setScore(correct);
    setStage('done');
    if (earned > 0) {
      addPoints(earned);
      // save to Supabase
      if (profile?.id) {
        supabase.from('user_points').insert({
          user_id: profile.id,
          grade,
          subject,
          score: correct,
          points_earned: earned,
        }).then(() => {});
      }
    }
    if (correct >= 7) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  const reset = () => {
    setStage('setup');
    setQuestions([]);
    setScore(0);
    setShowConfetti(false);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  if (stage === 'setup') {
    return (
      <div className="px-4 py-5">
        <h1 className="text-2xl font-extrabold mb-1">Take a Quiz</h1>
        <p className="text-sm text-gray-600 mb-5">10 questions • 10 minutes • +10 points each</p>

        <div className="mb-5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Grade</label>
          <div className="flex gap-2">
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${
                  grade === g ? 'bg-black text-[#FFD600] scale-105' : 'bg-white border-2 border-gray-200 text-gray-600'
                }`}
              >
                Grade {g}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Subject</label>
          <div className="grid grid-cols-1 gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`px-4 py-3 rounded-2xl text-left text-sm font-semibold transition-all flex items-center justify-between ${
                  subject === s ? 'bg-[#FFD600] text-black border-2 border-black' : 'bg-white border-2 border-gray-200 text-gray-700'
                }`}
              >
                {s}
                {subject === s && <CheckCircle2 className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {topics.length > 0 && (
          <div className="mb-5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Topic (optional)</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTopic('')}
                className={`px-3 py-2 rounded-full text-xs font-semibold ${
                  !topic ? 'bg-black text-[#FFD600]' : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >
                All topics
              </button>
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`px-3 py-2 rounded-full text-xs font-semibold ${
                    topic === t ? 'bg-black text-[#FFD600]' : 'bg-white border border-gray-200 text-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={startQuiz}
          disabled={!subject || loading}
          className="w-full bg-[#FFD600] text-black font-extrabold py-4 rounded-2xl text-base disabled:opacity-50 active:scale-95 transition-transform shadow-md"
        >
          {loading ? 'Loading...' : 'Start Quiz'}
        </button>
      </div>
    );
  }

  if (stage === 'quiz') {
    const q = gradeQuestions[current];
    if (!q) return <div className="px-4 py-10 text-center">No questions available.</div>;
    const progress = ((current + 1) / gradeQuestions.length) * 100;
    return (
      <div className="px-4 py-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-700">
            Q{current + 1} / {gradeQuestions.length}
          </span>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-black text-[#FFD600]'}`}>
            <Clock className="w-4 h-4" />
            {mins}:{secs.toString().padStart(2, '0')}
          </div>
        </div>

        <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-[#FFD600] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-5">
          <div className="text-xs font-bold text-[#FFD600] uppercase tracking-wide mb-2">{q.topic}</div>
          <h2 className="text-lg font-bold text-black leading-snug">{q.question}</h2>
        </div>

        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            const letters = ['A', 'B', 'C', 'D'];
            const isSel = selected === i;
            return (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-full px-4 py-4 rounded-2xl text-left font-semibold text-sm flex items-center gap-3 transition-all ${
                  isSel ? 'bg-black text-[#FFD600] border-2 border-black scale-[1.02]' : 'bg-white border-2 border-gray-200 text-gray-700'
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${isSel ? 'bg-[#FFD600] text-black' : 'bg-gray-100 text-gray-500'}`}>
                  {letters[i]}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        <button
          onClick={nextQuestion}
          disabled={selected === null}
          className="w-full mt-6 bg-[#FFD600] text-black font-extrabold py-4 rounded-2xl disabled:opacity-40 active:scale-95 transition-transform shadow-md flex items-center justify-center gap-2"
        >
          {current + 1 < gradeQuestions.length ? 'Next Question' : 'Finish Quiz'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // done
  const total = gradeQuestions.length || 10;
  const pct = Math.round((score / total) * 100);
  const earned = score * 10;
  return (
    <div className="px-4 py-8 relative">
      {showConfetti && <Confetti />}
      <div className="text-center">
        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${score >= 7 ? 'bg-[#FFD600]' : 'bg-gray-200'}`}>
          {score >= 7 ? <PartyPopper className="w-12 h-12 text-black" strokeWidth={2} /> : <Brain className="w-12 h-12 text-gray-500" strokeWidth={2} />}
        </div>
        <h1 className="text-3xl font-extrabold">{score} / {total}</h1>
        <p className="text-gray-600 mt-1">{pct}% correct</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-[#FFD600] text-black font-extrabold px-5 py-2.5 rounded-full">
          +{earned} points earned
        </div>
      </div>

      <div className="mt-8 bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-sm mb-3">Review answers</h3>
        <div className="space-y-2">
          {gradeQuestions.map((q, i) => {
            const correct = answers[i] === q.correct_answer;
            return (
              <div key={q.id} className="flex items-start gap-2 text-sm">
                {correct ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                )}
                <span className="text-gray-700">{q.question}</span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={reset}
        className="w-full mt-6 bg-black text-[#FFD600] font-extrabold py-4 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-5 h-5" />
        Take Another Quiz
      </button>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 40 });
  const colors = ['#FFD600', '#000000', '#FFD600', '#333333'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 2 + Math.random() * 2;
        const size = 6 + Math.random() * 8;
        const color = colors[i % colors.length];
        return (
          <div
            key={i}
            className="absolute top-0 rounded-sm"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size * 1.5}px`,
              backgroundColor: color,
              animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function generateFallback(grade: number, subject: string): QuizQuestion[] {
  const lang = subject;
  if (lang === 'Setswana Home Language') {
    const base: Omit<QuizQuestion, 'id' | 'grade' | 'subject'>[] = [
      { topic: 'Maleme', question: '"Dumela" e ra go reng?', options: ['Sala gabotse', 'Dumela / Hello', 'Tshwarelo', 'O kae?'], correct_answer: 1 },
      { topic: 'Maleme', question: 'Setswana ke one wa mafatshe a mangwe a a fitlhelwang kae?', options: ['Aforika Borwa le Botswana', 'Nigeria', 'Kenya', 'Ghana'], correct_answer: 0 },
      { topic: 'Maleme', question: '"Metsi" ke eng?', options: ['Metsi a manote', 'Metsi a a nang le eng', 'Metsi / Water', 'Metsi a pula'], correct_answer: 2 },
      { topic: 'Maleme', question: '"Tshwarelo" e ra go reng?', options: ['Thank you', 'Sorry / Apologies', 'Goodbye', 'Hello'], correct_answer: 1 },
      { topic: 'Maleme', question: 'Ngwana wa mosetsana o bidiwa eng?', options: ['Mosimane', 'Morwadi', 'Rrangwane', 'Malome'], correct_answer: 1 },
      { topic: 'Maleme', question: '"Pula" e ra go reng?', options: ['Letsatsi', 'Pula / Rain', 'Metsi', 'Motshegare'], correct_answer: 1 },
      { topic: 'Maleme', question: 'Go tsaya e nngwe ya diela tsa Setswana, o dira eng?', options: ['Go bina', 'Go raloka', 'Go apara', 'Go bina traditional'], correct_answer: 2 },
      { topic: 'Maleme', question: '"Loago" ke eng?', options: ['Lefatshe', 'Loago / Culture', 'Metsi', 'Pula'], correct_answer: 1 },
      { topic: 'Maleme', question: '"Ke a leboga" e ra go reng?', options: ['Sorry', 'Thank you', 'Goodbye', 'Hello'], correct_answer: 1 },
      { topic: 'Maleme', question: 'Lefatshe la Botswana le bua puo efe thata?', options: ['English', 'Setswana', 'Sepedi', 'isiZulu'], correct_answer: 1 },
    ];
    return base.map((b, i) => ({ ...b, id: `fb-st-${i}`, grade, subject }));
  }
  if (lang === 'Sepedi Home Language') {
    const base: Omit<QuizQuestion, 'id' | 'grade' | 'subject'>[] = [
      { topic: 'Maleme', question: '"Thobela" e ra go reng?', options: ['Sala gabotse', 'Dumela / Hello', 'Tshwarelo', 'O kae?'], correct_answer: 1 },
      { topic: 'Maleme', question: 'Sepedi ke puo e e buiwang kae thata?', options: ['Limpopo', 'KZN', 'Western Cape', 'Gauteng'], correct_answer: 0 },
      { topic: 'Maleme', question: '"Metsi" ke eng?', options: ['Metsi / Water', 'Metsi a manote', 'Metsi a pula', 'Metsi a a sa lemeng'], correct_answer: 0 },
      { topic: 'Maleme', question: '"Ke a leboga" e ra go reng?', options: ['Sorry', 'Thank you', 'Goodbye', 'Hello'], correct_answer: 1 },
      { topic: 'Maleme', question: 'Ngwana wa mosimane o bidiwa eng?', options: ['Morwadi', 'Mosimane', 'Malome', 'Rramogolo'], correct_answer: 1 },
      { topic: 'Maleme', question: '"Pula" e ra go reng?', options: ['Letsatsi', 'Metsi', 'Pula / Rain', 'Motshegare'], correct_answer: 2 },
      { topic: 'Maleme', question: '"Setso" ke eng?', options: ['Lefatshe', 'Setso / Culture', 'Metsi', 'Pula'], correct_answer: 1 },
      { topic: 'Maleme', question: '"Tshwarelo" e ra go reng?', options: ['Thank you', 'Sorry / Apologies', 'Goodbye', 'Hello'], correct_answer: 1 },
      { topic: 'Maleme', question: 'Go apara diaparo tsa setso go biduwa eng?', options: ['Go raloka', 'Go bina', 'Go apara setso', 'Go bina traditional'], correct_answer: 2 },
      { topic: 'Maleme', question: 'Motho yo a sa tswang pele go bua Sepedi o dira eng?', options: ['Go bina', 'Go raloka', 'Go bua Sepedi', 'Go apara'], correct_answer: 2 },
    ];
    return base.map((b, i) => ({ ...b, id: `fb-sp-${i}`, grade, subject }));
  }
  if (lang === 'isiZulu Home Language') {
    const base: Omit<QuizQuestion, 'id' | 'grade' | 'subject'>[] = [
      { topic: 'Izilimi', question: '"Sawubona" kusho ukuthini?', options: ['Hamba kahle', 'Sawubona / Hello', 'Ngiyaxolisa', 'Uphi?'], correct_answer: 1 },
      { topic: 'Izilimi', question: 'isiZulu isetshenziswa kakhulu ngasiphi isifundazwe?', options: ['KZN', 'Western Cape', 'Gauteng', 'Limpopo'], correct_answer: 0 },
      { topic: 'Izilimi', question: '"Amanzi" kusho ukuthini?', options: ['Amanzi / Water', 'Izlindle', 'Umbila', 'Inkanyezi'], correct_answer: 0 },
      { topic: 'Izilimi', question: '"Ngiyabonga" kusho ukuthini?', options: ['Uzwe', 'Ngiyaxolisa', 'Ngiyabonga / Thank you', 'Sawubona'], correct_answer: 2 },
      { topic: 'Izilimi', question: 'Umntwana wesilisa ubizwa ngani?', options: ['Intombi', 'Umndeni', 'Insizwa', 'Umfana'], correct_answer: 3 },
      { topic: 'Izilimi', question: '"Imvula" kusho ukuthini?', options: ['Ilanga', 'Amanzi', 'Imvula / Rain', 'Isikhathi'], correct_answer: 2 },
      { topic: 'Izilimi', question: '"Isiko" kusho ukuthini?', options: ['Iswe', 'Isiko / Culture', 'Amanzi', 'Imvula'], correct_answer: 1 },
      { topic: 'Izilimi', question: '"Ngiyaxolisa" kusho ukuthini?', options: ['Ngiyabonga', 'Ngiyaxolisa / Sorry', 'Hamba kahle', 'Sawubona'], correct_answer: 1 },
      { topic: 'Izilimi', question: 'Ukuhlamba izinkamba zomzimba kubizwa ngani?', options: ['Ukuhlamba', 'Ukugqoka', 'Ukuhamba', 'Ukudla'], correct_answer: 0 },
      { topic: 'Izilimi', question: 'Inhlokodolobha yaseNingizimu Afrika izwakala kanjani?', options: ['Pretoria', 'Cape Town', 'Durban', 'Johannesburg'], correct_answer: 2 },
    ];
    return base.map((b, i) => ({ ...b, id: `fb-zu-${i}`, grade, subject }));
  }
  const base: Omit<QuizQuestion, 'id' | 'grade' | 'subject'>[] = [
    { topic: 'General', question: 'How many provinces does South Africa have?', options: ['6', '7', '8', '9'], correct_answer: 3 },
    { topic: 'General', question: 'Which ocean is on the east coast of South Africa?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], correct_answer: 1 },
    { topic: 'General', question: 'What is the currency of South Africa?', options: ['Dollar', 'Pound', 'Rand', 'Euro'], correct_answer: 2 },
    { topic: 'General', question: 'Nelson Mandela was released from prison in which year?', options: ['1989', '1990', '1991', '1994'], correct_answer: 1 },
    { topic: 'General', question: 'Which is the largest city in South Africa?', options: ['Cape Town', 'Durban', 'Johannesburg', 'Pretoria'], correct_answer: 2 },
    { topic: 'General', question: 'The South African flag has how many colors?', options: ['4', '5', '6', '7'], correct_answer: 2 },
    { topic: 'General', question: 'Table Mountain is in which city?', options: ['Pretoria', 'Cape Town', 'Durban', 'PE'], correct_answer: 1 },
    { topic: 'General', question: 'Which language is most spoken in South Africa?', options: ['English', 'Afrikaans', 'isiZulu', 'Xhosa'], correct_answer: 2 },
    { topic: 'General', question: 'The Union Buildings are located in?', options: ['Cape Town', 'Pretoria', 'Bloemfontein', 'PE'], correct_answer: 1 },
    { topic: 'General', question: 'Freedom Day in South Africa is celebrated on which date?', options: ['27 April', '16 June', '9 August', '24 September'], correct_answer: 0 },
  ];
  return base.map((b, i) => ({ ...b, id: `fb-${i}`, grade, subject }));
}
