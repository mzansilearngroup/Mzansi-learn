import { Home, Brain, BookOpen, Gift, User } from 'lucide-react';

const NAV = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/quiz', label: 'Quiz', icon: Brain },
  { path: '/papers', label: 'Papers', icon: BookOpen },
  { path: '/rewards', label: 'Rewards', icon: Gift },
  { path: '/profile', label: 'Profile', icon: User },
];

export function BottomNav({ path, navigate }: { path: string; navigate: (p: string) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black border-t-4 border-[#FFD600] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-2xl mx-auto flex items-stretch justify-around">
        {NAV.map((item) => {
          const active = path === item.path || (item.path !== '/' && path.startsWith(item.path));
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  active ? 'bg-[#FFD600] text-black scale-110' : 'text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-semibold ${active ? 'text-[#FFD600]' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
