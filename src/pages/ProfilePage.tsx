import { useEffect, useState } from 'react';
import { User as UserIcon, Phone, School, Save, Award, FileDown, Brain, type LucideIcon } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import { GRADES } from '@/lib/constants';

const AVATARS = ['🦁', '🐯', '🦅', '🐘', '🦓', '🦛', '🦒', '🐅', '🐆', '🦏', '🐊', '🎓', '📚', '✏️', '🧠'];

export function ProfilePage() {
  const { profile, saveProfile, setPhone, user, refreshUser } = useUser();
  const [name, setName] = useState(profile?.name ?? '');
  const [grade, setGrade] = useState(profile?.grade ?? 10);
  const [school, setSchool] = useState(profile?.school ?? '');
  const [phone, setPhoneState] = useState(profile?.phone ?? '');
  const [avatar, setAvatar] = useState(profile?.avatar ?? '🎓');
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ quizzes: 0, papers: 0, rank: 0 });

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setGrade(profile.grade);
      setSchool(profile.school ?? '');
      setPhoneState(profile.phone);
      setAvatar(profile.avatar ?? '🎓');
    }
  }, [profile]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const [{ count: quizzes }, { count: papers }] = await Promise.all([
        supabase.from('user_points').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('papers').select('*', { count: 'exact', head: true }),
      ]);
      // rank
      const { count: higher } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gt('points', user.points);
      setStats({
        quizzes: quizzes ?? 0,
        papers: papers ?? 0,
        rank: (higher ?? 0) + 1,
      });
    })();
  }, [user]);

  const handleSave = async () => {
    let phoneVal = phone.trim();
    if (phoneVal && !phoneVal.startsWith('+')) {
      phoneVal = '+' + phoneVal.replace(/^0/, '27');
    }
    if (phoneVal && phoneVal !== profile?.phone) {
      await setPhone(phoneVal);
    }
    await saveProfile({
      id: profile?.id,
      name: name.trim() || 'Learner',
      grade,
      school: school.trim() || undefined,
      phone: phoneVal,
      points: profile?.points ?? 0,
      avatar,
    });
    await refreshUser();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="px-4 py-5">
      <h1 className="text-2xl font-extrabold mb-5">My Profile</h1>

      <div className="bg-gradient-to-br from-black to-gray-900 rounded-3xl p-5 mb-5 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#FFD600] flex items-center justify-center text-4xl mb-2">
          {avatar}
        </div>
        <div className="text-white font-extrabold text-lg">{name || 'Learner'}</div>
        <div className="text-[#FFD600] text-xs font-semibold">Grade {grade} • {profile?.points ?? 0} points</div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard icon={Brain} label="Quizzes" value={stats.quizzes} />
        <StatCard icon={FileDown} label="Papers" value={stats.papers} />
        <StatCard icon={Award} label="Rank" value={`#${stats.rank}`} />
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Avatar</label>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                  avatar === a ? 'bg-[#FFD600] scale-110 ring-2 ring-black' : 'bg-white border border-gray-200'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <Field icon={UserIcon} label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 bg-white text-sm font-medium focus:border-[#FFD600] focus:outline-none"
          />
        </Field>

        <Field label="Grade">
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
        </Field>

        <Field icon={School} label="School (optional)">
          <input
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="Your school name"
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 bg-white text-sm font-medium focus:border-[#FFD600] focus:outline-none"
          />
        </Field>

        <Field icon={Phone} label="Phone (your login)">
          <input
            value={phone}
            onChange={(e) => setPhoneState(e.target.value)}
            placeholder="e.g. 0821234567"
            type="tel"
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 bg-white text-sm font-medium focus:border-[#FFD600] focus:outline-none"
          />
        </Field>

        <button
          onClick={handleSave}
          className="w-full bg-[#FFD600] text-black font-extrabold py-4 rounded-2xl active:scale-95 transition-transform shadow-md flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}

function Field({ icon: _icon, label, children }: { icon?: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-2xl p-3 text-center border border-gray-100">
      <Icon className="w-5 h-5 text-[#FFD600] mx-auto mb-1" strokeWidth={2} />
      <div className="font-extrabold text-lg">{value}</div>
      <div className="text-[10px] text-gray-500 font-semibold">{label}</div>
    </div>
  );
}
