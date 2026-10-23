import { Brain, BookOpen, Gift, Trophy, Search, ArrowRight, Sparkles, MessageSquare } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export function HomePage({ navigate }: { navigate: (p: string) => void }) {
  const { profile } = useUser();
  const name = profile?.name ? profile.name.split(' ')[0] : 'Learner';

  const cards = [
    {
      title: 'Take Quiz',
      desc: 'Test your knowledge',
      icon: Brain,
      path: '/quiz',
      bg: 'bg-gradient-to-br from-[#FFD600] to-[#FFB800]',
      text: 'text-black',
    },
    {
      title: 'Past Papers',
      desc: '2024 - 2025',
      icon: BookOpen,
      path: '/papers',
      bg: 'bg-white',
      text: 'text-black',
      border: 'border-2 border-black',
    },
    {
      title: 'My Points & Rewards',
      desc: 'Redeem your points',
      icon: Gift,
      path: '/rewards',
      bg: 'bg-black',
      text: 'text-[#FFD600]',
    },
    {
      title: 'Leaderboard',
      desc: 'Top learners',
      icon: Trophy,
      path: '/leaderboard',
      bg: 'bg-gradient-to-br from-[#FFD600] to-[#E6C200]',
      text: 'text-black',
    },
  ];

  return (
    <div className="px-4 py-5">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-black">
          Sawubona, {name}! 👋
        </h1>
        <p className="text-sm text-gray-600 mt-1">Grade {profile?.grade ?? 10} • Let's learn and earn today</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search subjects, papers, quizzes..."
          onFocus={() => navigate('/papers')}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-sm font-medium focus:border-[#FFD600] focus:outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.path}
              onClick={() => navigate(c.path)}
              className={`${c.bg} ${c.text} ${c.border ?? ''} rounded-3xl p-4 min-h-[140px] flex flex-col justify-between text-left active:scale-95 transition-transform shadow-sm`}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${c.bg === 'bg-black' ? 'bg-[#FFD600] text-black' : 'bg-black/10'}`}>
                <Icon className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div>
                <div className="font-extrabold text-base leading-tight">{c.title}</div>
                <div className={`text-xs mt-0.5 ${c.text === 'text-[#FFD600]' ? 'text-gray-400' : 'opacity-70'}`}>
                  {c.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 bg-gradient-to-r from-black to-gray-900 rounded-3xl p-4 flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 rounded-xl bg-[#FFD600] flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-black" strokeWidth={2.5} />
        </div>
        <div className="flex-1 text-white">
          <div className="font-bold text-sm">Earn 10 points per correct answer</div>
          <div className="text-xs text-gray-400">Take quizzes to climb the leaderboard</div>
        </div>
        <button
          onClick={() => navigate('/quiz')}
          className="bg-[#FFD600] text-black font-bold text-xs px-3 py-2 rounded-xl active:scale-95 transition-transform"
        >
          Start
        </button>
      </div>

      <div className="mt-6 p-4 border-2 border-dashed border-[#FFC72C] rounded-2xl bg-white">
        <button
          onClick={() => navigate('/request-subject')}
          className="w-full bg-[#FFC72C] text-black font-extrabold py-3 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-5 h-5" />
          Request a Subject — Tell us what to add
        </button>
        <p className="text-xs text-center text-gray-500 mt-2">
          Want Tourism? Technical Sciences? Tell us (5 per day)
        </p>
      </div>

      <div className="text-center mt-10 mb-2">
        <a
          href="https://mzansi-zero-jobs-hus-8ov6.bolt.host"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 inline-flex items-center gap-1 hover:text-gray-600 transition-colors"
        >
          Looking for work? Try Mzansi Zero Jobs <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
