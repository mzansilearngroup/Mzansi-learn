import { useEffect, useState } from 'react';
import { CheckCircle2, Send, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SUBJECTS, GRADES, YEARS, PAPER_TYPES } from '@/lib/constants';
import { useUser } from '@/context/UserContext';

const MAX_PER_DAY = 5;
const STORE_KEY = 'mzansi_req_limit';

// Profanity word list (basic filter)
const PROFANITY = [
  'fuck', 'shit', 'bitch', 'bastard', 'dick', 'piss', 'asshole', 'cunt',
  'dook', 'poes', 'naai', 'moegoe', 'domkop', 'kak', 'doos',
];

// URL / link pattern
const URL_RE = /(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|co\.za|io|ly|me)\b)/i;

// Phone number / long digit sequence pattern (4+ consecutive digits)
const NUM_RE = /\d{4,}/;

// Non-Latin / non-ASCII characters (blocks non-English scripts)
const NON_ASCII_RE = /[^\x00-\x7F]/;

type Stored = { date: string; count: number };

function getSastDate(): string {
  // SAST = UTC+2
  const now = new Date();
  const sast = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return sast.toISOString().slice(0, 10);
}

function getSastStartOfNextDay(): number {
  const now = new Date();
  const sastNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const tomorrow = new Date(Date.UTC(sastNow.getUTCFullYear(), sastNow.getUTCMonth(), sastNow.getUTCDate() + 1, 0, 0, 0));
  return tomorrow.getTime() - 2 * 60 * 60 * 1000;
}

function getStoredCount(): { count: number; date: string } {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { count: 0, date: getSastDate() };
    const parsed = JSON.parse(raw) as Stored;
    const today = getSastDate();
    if (parsed.date !== today) {
      return { count: 0, date: today };
    }
    return { count: parsed.count, date: today };
  } catch {
    return { count: 0, date: getSastDate() };
  }
}

function saveStoredCount(count: number) {
  const data: Stored = { date: getSastDate(), count };
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function validateReason(text: string): string | null {
  if (!text.trim()) return null; // optional field
  if (NON_ASCII_RE.test(text)) {
    return 'Please write your reason in English only.';
  }
  const lower = text.toLowerCase();
  for (const w of PROFANITY) {
    if (lower.includes(w)) {
      return 'Please remove inappropriate language.';
    }
  }
  if (URL_RE.test(text)) {
    return 'Links are not allowed in the reason field.';
  }
  if (NUM_RE.test(text)) {
    return 'Phone numbers and long numbers are not allowed in the reason.';
  }
  if (text.length > 300) {
    return 'Reason is too long (max 300 characters).';
  }
  return null;
}

export function RequestPaperPage({ navigate }: { navigate: (p: string) => void }) {
  const { profile } = useUser();
  const [grade, setGrade] = useState(10);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [year, setYear] = useState(2026);
  const [paperType, setPaperType] = useState('P1');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [leftToday, setLeftToday] = useState(MAX_PER_DAY);
  const [validationError, setValidationError] = useState('');
  const [rateError, setRateError] = useState('');

  useEffect(() => {
    const { count: stored } = getStoredCount();
    setLeftToday(Math.max(0, MAX_PER_DAY - stored));

    // Also check server-side count for today (by phone)
    (async () => {
      const phone = profile?.phone;
      if (!phone) return;
      const sastToday = getSastDate();
      const startOfDay = sastToday + 'T00:00:00+02:00';
      const endOfDay = sastToday + 'T23:59:59+02:00';
      const { count: dbCount } = await supabase
        .from('paper_requests')
        .select('*', { count: 'exact', head: true })
        .eq('phone', phone)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);
      const serverUsed = dbCount ?? 0;
      const localUsed = stored;
      const effectiveUsed = Math.max(serverUsed, localUsed);
      setLeftToday(Math.max(0, MAX_PER_DAY - effectiveUsed));
      if (effectiveUsed !== localUsed) {
        saveStoredCount(effectiveUsed);
      }
    })();
  }, [profile?.phone]);

  const handleReasonChange = (val: string) => {
    setReason(val);
    setValidationError('');
  };

  const submit = async () => {
    setRateError('');
    const { count: stored } = getStoredCount();
    const used = Math.max(stored, MAX_PER_DAY - leftToday);
    if (used >= MAX_PER_DAY) {
      setRateError('Come back tomorrow — 5 max per day');
      return;
    }

    // Validate reason
    const reasonErr = validateReason(reason);
    if (reasonErr) {
      setValidationError(reasonErr);
      return;
    }

    setLoading(true);
    const phone = profile?.phone ?? '';

    // Check if request exists
    const { data: existing } = await supabase
      .from('paper_requests')
      .select('id, request_count')
      .eq('grade', grade)
      .eq('subject', subject)
      .eq('year', year)
      .eq('paper_type', paperType)
      .maybeSingle();

    if (existing) {
      const newCount = (existing.request_count ?? 1) + 1;
      await supabase.from('paper_requests').update({ request_count: newCount }).eq('id', existing.id);
      setCount(newCount);
    } else {
      await supabase.from('paper_requests').insert({
        grade,
        subject,
        year,
        paper_type: paperType,
        reason: reason || null,
        phone,
        status: 'pending',
        request_count: 1,
      });
      setCount(1);
    }

    // Increment local rate limit counter
    const newUsed = used + 1;
    saveStoredCount(newUsed);
    setLeftToday(Math.max(0, MAX_PER_DAY - newUsed));

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="px-4 py-10 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#FFD600] flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-black" strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-extrabold mb-2">Thanks! We'll add it soon.</h1>
        <p className="text-gray-600 text-sm">{count} other learner{count !== 1 ? 's' : ''} also requested this.</p>
        <div className="mt-4 bg-white rounded-2xl p-4 text-left text-sm border border-gray-100">
          <div className="font-bold mb-1">{subject}</div>
          <div className="text-gray-500">Grade {grade} • {year} • {paperType}</div>
        </div>
        <div className="mt-3 text-xs text-[#FFD600] font-bold">
          You have {leftToday}/5 requests left today
        </div>
        <button
          onClick={() => navigate('/papers')}
          className="mt-6 bg-black text-[#FFD600] font-bold px-6 py-3 rounded-2xl text-sm active:scale-95 transition-transform"
        >
          Back to Papers
        </button>
      </div>
    );
  }

  const blocked = leftToday <= 0;

  return (
    <div className="px-4 py-5">
      <h1 className="text-2xl font-extrabold mb-1">Request a Paper</h1>
      <p className="text-sm text-gray-600 mb-5">Can't find what you need? Let us know.</p>

      <div className="space-y-4">
        <Field label="Grade">
          <select value={grade} onChange={(e) => setGrade(Number(e.target.value))} className={selectCls}>
            {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
          </select>
        </Field>

        <Field label="Subject">
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className={selectCls}>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>

        <Field label="Year">
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={selectCls}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>

        <Field label="Paper Type">
          <select value={paperType} onChange={(e) => setPaperType(e.target.value)} className={selectCls}>
            {PAPER_TYPES.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
          </select>
        </Field>

        <Field label="Reason (optional)">
          <textarea
            value={reason}
            onChange={(e) => handleReasonChange(e.target.value)}
            rows={3}
            placeholder="Why do you need this paper? (English only)"
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 bg-white text-sm focus:border-[#FFD600] focus:outline-none resize-none"
          />
          {validationError && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" /> {validationError}
            </div>
          )}
          <div className="mt-1.5 text-xs font-bold text-[#FFD600]">
            You have {leftToday}/5 requests left today
          </div>
        </Field>

        {blocked && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm font-semibold rounded-2xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Come back tomorrow — 5 max per day
          </div>
        )}

        {rateError && !blocked && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm font-semibold rounded-2xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> {rateError}
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading || blocked}
          className="w-full bg-[#FFD600] text-black font-extrabold py-4 rounded-2xl active:scale-95 transition-transform shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
          {loading ? 'Submitting...' : blocked ? 'Limit Reached' : 'Submit Request'}
        </button>
      </div>
    </div>
  );
}

const selectCls = 'w-full px-4 py-3 rounded-2xl border-2 border-gray-200 bg-white text-sm font-medium focus:border-[#FFD600] focus:outline-none';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
