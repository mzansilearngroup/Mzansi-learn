import { useEffect, useState } from 'react';
import { Trophy, Crown, Medal } from 'lucide-react';
import { supabase, type User } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';
import { GRADES } from '@/lib/constants';

type Tab = 'week' | 'alltime' | 'grade';

export function LeaderboardPage() {
  const { profile } = useUser();
  const [tab, setTab] = useState<Tab>('week');
  const [grade, setGrade] = useState<number>(profile?.grade ?? 10);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let q = supabase.from('users').select('*').order('points', { ascending: false }).limit(50);
      if (tab === 'grade') q = q.eq('grade', grade);
      const { data } = await q;
      setUsers((data as User[]) ?? []);
      setLoading(false);
    })();
  }, [tab, grade]);

  const top = users.slice(0, 10);
  const podium = top.slice(0, 3);
  const rest = top.slice(3);
  const currentId = profile?.id;

  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean);
  const podiumStyles = [
    { h: 'h-16', medal: Medal, color: 'bg-gray-300', pos: 2 },
    { h: 'h-24', medal: Crown, color: 'bg-[#FFD600]', pos: 1 },
    { h: 'h-12', medal: Medal, color: 'bg-amber-600', pos: 3 },
  ];

  return (
    <div className="px-4 py-5">
      <h1 className="text-2xl font-extrabold mb-1 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-[#FFD600]" /> Leaderboard
      </h1>
      <p className="text-sm text-gray-600 mb-4">Top learners in Mzansi</p>

      <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
        {([
          ['week', 'This Week'],
          ['alltime', 'All Time'],
          ['grade', 'By Grade'],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              tab === key ? 'bg-black text-[#FFD600] shadow-sm' : 'text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'grade' && (
        <div className="flex gap-2 mb-4">
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => setGrade(g)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                grade === g ? 'bg-[#FFD600] text-black' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              Grade {g}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>
      ) : top.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No learners yet. Be the first!</div>
      ) : (
        <>
          {podium.length >= 2 && (
            <div className="flex items-end justify-center gap-2 mb-6 mt-4">
              {podiumOrder.map((u, i) => {
                const style = podiumStyles[i];
                const Icon = style.medal;
                const isMe = u.id === currentId;
                return (
                  <div key={u.id} className="flex flex-col items-center w-24">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-1 ${isMe ? 'ring-4 ring-[#FFD600]' : ''}`}>
                      {u.avatar ?? '🎓'}
                    </div>
                    <div className="text-xs font-bold text-center truncate w-full">{u.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-gray-500">{u.points} pts</div>
                    <div className={`${style.h} ${style.color} w-full rounded-t-xl flex items-center justify-center mt-1`}>
                      <Icon className={`w-6 h-6 ${style.pos === 1 ? 'text-black' : 'text-white'}`} strokeWidth={2} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-2">
            {rest.map((u, i) => {
              const rank = i + 4;
              const isMe = u.id === currentId;
              return (
                <div
                  key={u.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl border ${
                    isMe ? 'bg-[#FFD600] border-black' : 'bg-white border-gray-100'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${isMe ? 'bg-black text-[#FFD600]' : 'bg-gray-100 text-gray-600'}`}>
                    {rank}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg">{u.avatar ?? '🎓'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{u.name}{isMe && ' (You)'}</div>
                    <div className="text-[10px] text-gray-500">Grade {u.grade}</div>
                  </div>
                  <div className="font-extrabold text-sm">{u.points}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
