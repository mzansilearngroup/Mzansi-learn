export function AppFooter({ navigate }: { navigate: (p: string) => void }) {
  return (
    <div className="text-center mt-8 mb-4 px-4">
      <div className="flex items-center justify-center gap-3 pb-2">
        <button
          onClick={() => navigate('/privacy')}
          className="text-xs text-gray-500 font-semibold hover:text-gray-700 transition-colors"
        >
          Privacy Policy
        </button>
        <span className="text-gray-300">|</span>
        <a
          href="mailto:support@mzansilearn.co.za"
          className="text-xs text-gray-500 font-semibold hover:text-gray-700 transition-colors"
        >
          Contact
        </a>
      </div>
      <p className="text-[10px] text-gray-400">Mzansi Learn &amp; Earn — Funda. Earn-a. Pasa — Grade 10, 11, 12</p>
    </div>
  );
}
