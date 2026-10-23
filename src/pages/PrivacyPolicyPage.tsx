import { Shield, Mail, Database, Link2, Cookie, Users, Lock } from 'lucide-react';

export function PrivacyPolicyPage({ navigate }: { navigate: (p: string) => void }) {
  const sections = [
    {
      icon: Users,
      title: '1. Who We Are',
      text: 'Mzansi Learn & Earn is a free study app for Grade 10–12 learners in South Africa. We offer quizzes and links to official past papers. Contact us at support@mzansilearn.co.za.',
    },
    {
      icon: Database,
      title: '2. Data We Collect',
      text: 'We collect your email/phone for points tracking, and your quiz scores. We do NOT collect your ID number, bank details, or home address.',
    },
    {
      icon: Shield,
      title: '3. How We Use Your Data',
      text: 'Your data is used for points and the leaderboard only. We do not sell your data to anyone, ever.',
    },
    {
      icon: Link2,
      title: '4. Past Papers',
      text: 'All past papers link directly to the Department of Basic Education (DBE) and Western Cape government official websites. We do not host any exam papers ourselves.',
    },
    {
      icon: Lock,
      title: '5. Your Rights (POPI Act)',
      text: 'Under the South African POPI Act, you have the right to access and delete your data at any time. Email support@mzansilearn.co.za to request deletion. We comply fully with POPI.',
    },
    {
      icon: Cookie,
      title: '6. Cookies',
      text: 'We use local storage for login only. No tracking cookies, no advertising cookies.',
    },
    {
      icon: Users,
      title: '7. Children',
      text: 'If you are under 18, please use this app with your parent or teacher\'s permission.',
    },
    {
      icon: Mail,
      title: '8. Contact Us',
      text: 'Questions about your privacy? Email us at support@mzansilearn.co.za. We will respond within 7 days.',
    },
  ];

  return (
    <div className="px-4 py-5">
      <div className="bg-gradient-to-br from-black to-gray-900 rounded-3xl p-5 text-center mb-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFD600] flex items-center justify-center mb-3">
          <Shield className="w-7 h-7 text-black" strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-extrabold text-white">Privacy Policy</h1>
        <p className="text-[#FFD600] text-sm font-semibold mt-1">Mzansi Learn & Earn — Grade 10-12</p>
        <p className="text-gray-400 text-xs mt-2">Last updated: 21 May 2026</p>
      </div>

      <div className="space-y-3">
        {sections.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#FFD600] flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5 text-black" strokeWidth={2} />
                </div>
                <h2 className="font-extrabold text-sm text-black">{s.title}</h2>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed pl-10.5">{s.text}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-[#FFD600]/10 border border-[#FFD600]/30 rounded-2xl p-4 text-center">
        <Mail className="w-5 h-5 text-[#B8860B] mx-auto mb-2" />
        <p className="text-sm font-bold text-gray-700">support@mzansilearn.co.za</p>
      </div>

      <button
        onClick={() => navigate('/')}
        className="w-full mt-6 bg-black text-[#FFD600] font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
      >
        Back to Home
      </button>
    </div>
  );
}
