import { useEffect, useState } from 'react';
import {
  Upload, PlusCircle, Inbox, Users, Coins, Lock, FileText, Check, Trash2, Loader2, type LucideIcon,
} from 'lucide-react';
import { supabase, type Paper, type PaperRequest, type User } from '@/lib/supabase';
import { SUBJECTS, GRADES, YEARS, PAPER_TYPES, ADMIN_PASSWORD } from '@/lib/constants';

type Tab = 'upload' | 'quiz' | 'requests' | 'users' | 'points';

export function AdminPage({ navigate }: { navigate: (p: string) => void }) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>('upload');

  const checkPw = () => {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }
  };

  if (!authed) {
    return (
      <div className="px-4 py-10 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-[#FFD600]" />
        </div>
        <h1 className="text-xl font-extrabold mb-1">Admin Access</h1>
        <p className="text-sm text-gray-500 mb-5">Enter password to continue</p>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && checkPw()}
          placeholder="Password"
          className={`w-full max-w-xs px-4 py-3 rounded-2xl border-2 bg-white text-sm text-center font-bold focus:outline-none ${
            error ? 'border-red-500' : 'border-gray-200 focus:border-[#FFD600]'
          }`}
        />
        {error && <p className="text-red-500 text-xs mt-2">Wrong password. Redirecting...</p>}
        <button
          onClick={checkPw}
          className="mt-4 bg-[#FFD600] text-black font-extrabold px-8 py-3 rounded-2xl active:scale-95 transition-transform"
        >
          Enter
        </button>
      </div>
    );
  }

  const tabs: [Tab, string, LucideIcon][] = [
    ['upload', 'Upload Paper', Upload],
    ['quiz', 'Add Question', PlusCircle],
    ['requests', 'Requests', Inbox],
    ['users', 'Users', Users],
    ['points', 'Points', Coins],
  ];

  return (
    <div className="px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-extrabold">Admin Panel</h1>
        <button onClick={() => navigate('/')} className="text-xs text-gray-500 font-bold">Exit</button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {tabs.map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              tab === key ? 'bg-black text-[#FFD600]' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'upload' && <UploadPaperTab />}
      {tab === 'quiz' && <AddQuestionTab />}
      {tab === 'requests' && <RequestsTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'points' && <PointsTab />}
    </div>
  );
}

const selectCls = 'w-full px-4 py-3 rounded-2xl border-2 border-gray-200 bg-white text-sm font-medium focus:border-[#FFD600] focus:outline-none';

function UploadPaperTab() {
  const [grade, setGrade] = useState(12);
  const [year, setYear] = useState(2025);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [paperType, setPaperType] = useState('P1');
  const [session, setSession] = useState('Nov');
  const [pdfUrl, setPdfUrl] = useState('');
  const [memoUrl, setMemoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const handleAdd = async () => {
    if (!pdfUrl.trim()) {
      setErr('Please enter the official question paper URL');
      return;
    }
    setUploading(true);
    setErr('');
    const { error: dbErr } = await supabase.from('papers').insert({
      grade, year, subject, paper_type: paperType, session,
      pdf_url: pdfUrl.trim() || null,
      memo_url: memoUrl.trim() || null,
      views: 0,
    });
    if (dbErr) {
      setErr('Database error: ' + dbErr.message + '. Papers are read-only — use the Supabase dashboard or service role to add papers.');
    } else {
      setDone(true);
      setPdfUrl('');
      setMemoUrl('');
      setTimeout(() => setDone(false), 3000);
    }
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      {err && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{err}</div>}
      {done && <div className="bg-green-50 text-green-600 text-sm rounded-xl p-3 flex items-center gap-2"><Check className="w-4 h-4" /> Paper link added successfully!</div>}
      <div className="bg-[#FFD600]/10 border border-[#FFD600]/30 rounded-xl p-3 text-xs text-gray-600">
        Papers link to official DBE/Western Cape sources. Enter the official PDF URLs below.
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Grade</label>
          <select value={grade} onChange={(e) => setGrade(Number(e.target.value))} className={selectCls}>
            {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Year</label>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={selectCls}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Subject</label>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className={selectCls}>
          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Paper Type</label>
          <select value={paperType} onChange={(e) => setPaperType(e.target.value)} className={selectCls}>
            {PAPER_TYPES.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Session</label>
          <select value={session} onChange={(e) => setSession(e.target.value)} className={selectCls}>
            <option value="Nov">Nov</option>
            <option value="May-June">May-June</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Question Paper URL (official)</label>
        <input value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} placeholder="https://www.education.gov.za/..." className={selectCls} />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Memo URL (official)</label>
        <input value={memoUrl} onChange={(e) => setMemoUrl(e.target.value)} placeholder="https://www.education.gov.za/..." className={selectCls} />
      </div>
      <button
        onClick={handleAdd}
        disabled={uploading}
        className="w-full bg-[#FFD600] text-black font-extrabold py-4 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
        {uploading ? 'Adding...' : 'Add Paper Link'}
      </button>
    </div>
  );
}

function AddQuestionTab() {
  const [grade, setGrade] = useState(10);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!question || options.some((o) => !o.trim())) return;
    await supabase.from('quiz_questions').insert({
      grade, subject, topic: topic || 'General',
      question, options, correct_answer: correct,
    });
    setDone(true);
    setQuestion('');
    setOptions(['', '', '', '']);
    setTopic('');
    setCorrect(0);
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <div className="space-y-4">
      {done && <div className="bg-green-50 text-green-600 text-sm rounded-xl p-3 flex items-center gap-2"><Check className="w-4 h-4" /> Question added!</div>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Grade</label>
          <select value={grade} onChange={(e) => setGrade(Number(e.target.value))} className={selectCls}>
            {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Subject</label>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className={selectCls}>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Topic</label>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Algebra" className={selectCls} />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Question</label>
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 bg-white text-sm focus:border-[#FFD600] focus:outline-none resize-none" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Options (select correct)</label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => setCorrect(i)}
                className={`w-9 h-9 rounded-lg font-extrabold text-xs shrink-0 transition-all ${
                  correct === i ? 'bg-[#FFD600] text-black ring-2 ring-black' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {['A','B','C','D'][i]}
              </button>
              <input
                value={opt}
                onChange={(e) => {
                  const o = [...options];
                  o[i] = e.target.value;
                  setOptions(o);
                }}
                placeholder={`Option ${['A','B','C','D'][i]}`}
                className="flex-1 px-3 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm focus:border-[#FFD600] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>
      <button onClick={submit} className="w-full bg-[#FFD600] text-black font-extrabold py-4 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2">
        <PlusCircle className="w-5 h-5" /> Add Question
      </button>
    </div>
  );
}

function RequestsTab() {
  const [groups, setGroups] = useState<Array<{ grade: number; subject: string; year: number; paper_type: string; count: number; requests: PaperRequest[] }>>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('paper_requests').select('*').order('request_count', { ascending: false });
    const reqs = (data as PaperRequest[]) ?? [];
    const map = new Map<string, { grade: number; subject: string; year: number; paper_type: string; count: number; requests: PaperRequest[] }>();
    for (const r of reqs) {
      const key = `${r.grade}-${r.subject}-${r.year}-${r.paper_type}`;
      const ex = map.get(key);
      if (ex) {
        ex.count += r.request_count;
        ex.requests.push(r);
      } else {
        map.set(key, { grade: r.grade, subject: r.subject, year: r.year, paper_type: r.paper_type, count: r.request_count, requests: [r] });
      }
    }
    setGroups(Array.from(map.values()).sort((a, b) => b.count - a.count));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markDone = async (reqs: PaperRequest[]) => {
    for (const r of reqs) {
      await supabase.from('paper_requests').update({ status: 'done' }).eq('id', r.id);
    }
    load();
  };

  if (loading) return <div className="text-center py-8 text-gray-400 text-sm">Loading requests...</div>;
  if (groups.length === 0) return <div className="text-center py-8 text-gray-400 text-sm">No requests yet.</div>;

  return (
    <div className="space-y-3">
      {groups.map((g, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-bold text-sm">{g.subject}</div>
              <div className="text-xs text-gray-500">Grade {g.grade} • {g.year} • {g.paper_type}</div>
            </div>
            <div className="text-right">
              <div className="font-extrabold text-[#FFD600] text-lg">{g.count}</div>
              <div className="text-[10px] text-gray-400">requests</div>
            </div>
          </div>
          {g.requests[0].status !== 'done' && (
            <button
              onClick={() => markDone(g.requests)}
              className="mt-2 bg-black text-[#FFD600] text-xs font-bold px-4 py-2 rounded-xl active:scale-95 transition-transform flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Mark Done
            </button>
          )}
          {g.requests[0].status === 'done' && (
            <span className="mt-2 inline-block text-xs font-bold text-green-600">Done</span>
          )}
        </div>
      ))}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('users').select('*').order('points', { ascending: false });
      setUsers((data as User[]) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>;

  const totalPoints = users.reduce((s, u) => s + u.points, 0);
  const byGrade = { 10: 0, 11: 0, 12: 0 };
  users.forEach((u) => { byGrade[u.grade as keyof typeof byGrade] = (byGrade[u.grade as keyof typeof byGrade] ?? 0) + 1; });

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
          <div className="text-2xl font-extrabold">{users.length}</div>
          <div className="text-[10px] text-gray-500 font-semibold">Total Users</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
          <div className="text-2xl font-extrabold">{totalPoints}</div>
          <div className="text-[10px] text-gray-500 font-semibold">Total Points</div>
        </div>
      </div>
      <div className="space-y-2">
        {users.map((u, i) => (
          <div key={u.id} className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-gray-100">
            <span className="text-xs font-extrabold w-6 text-center text-gray-400">{i + 1}</span>
            <div className="text-xl">{u.avatar ?? '🎓'}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{u.name}</div>
              <div className="text-[10px] text-gray-500">Grade {u.grade} • {u.phone ?? 'no phone'}</div>
            </div>
            <div className="font-extrabold text-sm">{u.points}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PointsTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('users').select('*').order('points', { ascending: false });
      setUsers((data as User[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const adjust = async (id: string, delta: number) => {
    const u = users.find((x) => x.id === id);
    if (!u) return;
    const newPts = Math.max(0, u.points + delta);
    await supabase.from('users').update({ points: newPts }).eq('id', id);
    setUsers((prev) => prev.map((x) => (x.id === id ? { ...x, points: newPts } : x)).sort((a, b) => b.points - a.points));
  };

  const remove = async (id: string) => {
    await supabase.from('user_points').delete().eq('user_id', id);
    await supabase.from('users').delete().eq('id', id);
    setUsers((prev) => prev.filter((x) => x.id !== id));
  };

  if (loading) return <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <div key={u.id} className="flex items-center gap-2 bg-white rounded-2xl p-3 border border-gray-100">
          <div className="text-xl">{u.avatar ?? '🎓'}</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm truncate">{u.name}</div>
            <div className="text-xs text-gray-500">Grade {u.grade}</div>
          </div>
          <div className="font-extrabold text-sm w-14 text-right">{u.points}</div>
          <div className="flex gap-1">
            <button onClick={() => adjust(u.id, -10)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 font-bold text-sm active:scale-90">−</button>
            <button onClick={() => adjust(u.id, 10)} className="w-8 h-8 rounded-lg bg-green-50 text-green-600 font-bold text-sm active:scale-90">+</button>
            <button onClick={() => remove(u.id)} className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center active:scale-90">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
