import { useState } from 'react';
import { Gift, BookOpen, Smartphone, Wifi, Lock, Share2, Users, X, type LucideIcon } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { getLevel, REWARDS } from '@/lib/constants';

const ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Smartphone,
  Wifi,
};

export function RewardsPage() {
  const { profile } = useUser();
  const points = profile?.points ?? 0;
  const level = getLevel(points);
  const progressPct = Math.min(100, ((points - level.min) / (level.max - level.min)) * 100);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const learnerCount = 732;

  const shareLink = `${window.location.origin}/#/?ref=${profile?.phone ?? ''}`;
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Mzansi Learn & Earn', text: 'Join me on Mzansi Learn & Earn!', url: shareLink });
      } catch {
        /* cancelled */
      }
    } else {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="px-4 py-5">
      <div className="bg-gradient-to-br from-black to-gray-900 rounded-3xl p-5 text-center mb-5 shadow-lg">
        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Total Points</div>
        <div className="text-5xl font-extrabold text-[#FFD600] my-2">{points}</div>
        <div className="inline-flex items-center gap-1.5 bg-[#FFD600] text-black font-bold px-4 py-1.5 rounded-full text-sm">
          <Gift className="w-4 h-4" /> {level.name} Level
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>{level.min}</span>
            <span>{level.max === 3000 ? '1500+' : level.max}</span>
          </div>
          <div className="w-full h-2.5 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-[#FFD600] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-[#FFD600] rounded-2xl p-4 mb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-[#FFD600]" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <div className="font-extrabold text-black text-sm">Rewards unlock at 1000 learners!</div>
          <div className="text-xs text-black/70 font-medium">{learnerCount}/1000 learners joined</div>
          <div className="w-full h-1.5 bg-black/10 rounded-full mt-1.5 overflow-hidden">
            <div className="h-full bg-black rounded-full" style={{ width: `${(learnerCount / 1000) * 100}%` }} />
          </div>
        </div>
      </div>

      <h2 className="font-extrabold text-base mb-3">Rewards Store</h2>
      <div className="grid grid-cols-1 gap-3">
        {REWARDS.map((r) => {
          const Icon = ICONS[r.icon] ?? Gift;
          const locked = points < r.cost;
          return (
            <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${locked ? 'bg-gray-100' : 'bg-[#FFD600]'}`}>
                <Icon className={`w-6 h-6 ${locked ? 'text-gray-400' : 'text-black'}`} strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">{r.name}</h3>
                <p className="text-xs text-gray-500">{r.desc}</p>
                <div className="text-xs font-extrabold text-black mt-0.5">{r.cost} pts</div>
              </div>
              <button
                onClick={() => setShowModal(r.id)}
                disabled={locked}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  locked ? 'bg-gray-100 text-gray-400' : 'bg-black text-[#FFD600] active:scale-95'
                }`}
              >
                {locked ? <><Lock className="w-3.5 h-3.5" /> Locked</> : 'Redeem'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-white rounded-2xl p-4 border border-gray-100">
        <h3 className="font-bold text-sm mb-1">Invite friends</h3>
        <p className="text-xs text-gray-500 mb-3">Share Mzansi Learn & Earn with your classmates</p>
        <button
          onClick={handleShare}
          className="w-full bg-[#FFD600] text-black font-bold py-3 rounded-2xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          {copied ? 'Link copied!' : 'Share Invite Link'}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowModal(null)}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowModal(null)} className="absolute top-4 right-4 text-gray-400">
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FFD600] flex items-center justify-center mb-3">
              <Gift className="w-8 h-8 text-black" strokeWidth={2} />
            </div>
            <h2 className="text-lg font-extrabold">Coming soon!</h2>
            <p className="text-sm text-gray-600 mt-2">Keep learning! Invite friends to unlock rewards faster.</p>
            <button
              onClick={() => {
                setShowModal(null);
                handleShare();
              }}
              className="mt-4 bg-black text-[#FFD600] font-bold px-6 py-3 rounded-2xl text-sm active:scale-95 transition-transform w-full flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Invite Friends
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
