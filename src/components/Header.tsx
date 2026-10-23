import { GraduationCap, Gift } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export function Header({ navigate }: { navigate: (p: string) => void }) {
  const { profile } = useUser();
  const points = profile?.points ?? 0;

  return (
    <header className="sticky top-0 z-40 bg-black text-white border-b-4 border-[#FFD600]">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#FFD600] flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <div className="text-left leading-tight">
            <div className="font-extrabold text-sm tracking-tight">Mzansi Learn &amp; Earn</div>
            <div className="text-[10px] text-[#FFD600] font-medium">Funda. Earn-a. Pasa</div>
          </div>
        </button>
        <button
          onClick={() => navigate('/rewards')}
          className="flex items-center gap-1.5 bg-[#FFD600] text-black font-bold px-3 py-1.5 rounded-full text-sm shadow-sm active:scale-95 transition-transform"
        >
          <Gift className="w-4 h-4" strokeWidth={2.5} />
          {points}
          <span className="text-[10px] font-semibold opacity-70">pts</span>
        </button>
      </div>
    </header>
  );
}
