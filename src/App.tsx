import { useEffect, useState } from 'react';
import { UserProvider } from '@/context/UserContext';
import { useRoute } from '@/lib/router';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { AppFooter } from '@/components/AppFooter';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
import { HomePage } from '@/pages/HomePage';
import { QuizPage } from '@/pages/QuizPage';
import { PapersPage } from '@/pages/PapersPage';
import { PaperViewPage } from '@/pages/PaperViewPage';
import { RequestPaperPage } from '@/pages/RequestPaperPage';
import { RequestSubjectPage } from '@/pages/RequestSubjectPage';
import { RewardsPage } from '@/pages/RewardsPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AdminPage } from '@/pages/AdminPage';

function Routes({ path, navigate }: { path: string; navigate: (p: string) => void }) {
  if (path === '/') return <HomePage navigate={navigate} />;
  if (path === '/quiz') return <QuizPage />;
  if (path === '/papers') return <PapersPage navigate={navigate} />;
  if (path.startsWith('/papers/') && path !== '/papers/') {
    const paperId = path.replace('/papers/', '');
    return <PaperViewPage paperId={paperId} navigate={navigate} />;
  }
  if (path === '/request-paper') return <RequestPaperPage navigate={navigate} />;
  if (path === '/request-subject') return <RequestSubjectPage navigate={navigate} />;
  if (path === '/rewards') return <RewardsPage />;
  if (path === '/leaderboard') return <LeaderboardPage />;
  if (path === '/profile') return <ProfilePage />;
  if (path === '/admin') return <AdminPage navigate={navigate} />;
  if (path === '/privacy') return <PrivacyPolicyPage navigate={navigate} />;
  return <HomePage navigate={navigate} />;
}

function Shell() {
  const [path, navigate] = useRoute();
  const [installPrompt, setInstallPrompt] = useState<{ prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as unknown as { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> });
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const isAdmin = path === '/admin';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header navigate={navigate} />
      <main className="flex-1 max-w-2xl mx-auto w-full pb-24">
        <Routes path={path} navigate={navigate} />
        {path !== '/admin' && <AppFooter navigate={navigate} />}
      </main>
      {!isAdmin && <BottomNav path={path} navigate={navigate} />}
      {installPrompt && (
        <button
          onClick={async () => {
            await installPrompt.prompt();
            await installPrompt.userChoice;
            setInstallPrompt(null);
          }}
          className="fixed bottom-32 right-4 z-50 bg-[#FFD600] text-black font-bold px-4 py-2.5 rounded-2xl shadow-lg text-xs flex items-center gap-2 active:scale-95 transition-transform"
        >
          Install App
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <Shell />
    </UserProvider>
  );
}
