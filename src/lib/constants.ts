export const SUBJECTS: string[] = [
  'English Home Language',
  'English First Additional Language',
  'Afrikaans Home Language',
  'isiZulu Home Language',
  'Sepedi Home Language',
  'Setswana Home Language',
  'Life Orientation',
  'Mathematics',
  'Mathematical Literacy',
  'Physical Sciences',
  'Life Sciences',
  'Accounting',
  'Business Studies',
  'Agricultural Sciences',
  'History',
  'Geography',
  'Consumer Studies',
];

export const GRADES: number[] = [10, 11, 12];
export const YEARS: number[] = [2026, 2025, 2024, 2023];
export const PAPER_TYPES: string[] = ['P1', 'P2', 'Memo', 'Study Guide'];

export const SUBJECT_ICONS: Record<string, string> = {
  Mathematics: 'Calculator',
  'Mathematical Literacy': 'Calculator',
  'Physical Sciences': 'Atom',
  'Life Sciences': 'Dna',
  Accounting: 'Landmark',
  'Business Studies': 'Briefcase',
  Geography: 'Globe',
  History: 'ScrollText',
  'English Home Language': 'BookOpen',
  'English First Additional Language': 'BookOpen',
  'Afrikaans Home Language': 'Languages',
  'isiZulu Home Language': 'Languages',
  'Sepedi Home Language': 'Languages',
  'Setswana Home Language': 'Languages',
  'Life Orientation': 'HeartPulse',
  'Agricultural Sciences': 'Wheat',
  'Consumer Studies': 'ShoppingBasket',
};

export const ADMIN_PASSWORD = 'mzansi2026';

export const REWARDS = [
  { id: 'study-guide', name: 'Study Guide PDF', cost: 200, icon: 'BookOpen', desc: 'Download a premium study guide' },
  { id: 'airtime-10', name: 'Airtime R10', cost: 500, icon: 'Smartphone', desc: 'R10 airtime voucher' },
  { id: 'data-1gb', name: 'Data 1GB', cost: 1000, icon: 'Wifi', desc: '1GB data bundle' },
];

export function getLevel(points: number): { name: string; min: number; max: number; color: string } {
  if (points >= 1500) return { name: 'Gold', min: 1500, max: 3000, color: '#FFD600' };
  if (points >= 500) return { name: 'Silver', min: 500, max: 1500, color: '#9CA3AF' };
  return { name: 'Bronze', min: 0, max: 500, color: '#B45309' };
}
