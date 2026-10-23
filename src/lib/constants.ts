export const SUBJECTS: string[] = [
  'Mathematics',
  'Natural Sciences',
  'Social Sciences',
  'Economic Management Sciences',
  'Technology',
  'Creative Arts',
  'Life Orientation',
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

export const GRADE_9_SUBJECTS: string[] = [
  'Mathematics',
  'Natural Sciences',
  'Social Sciences',
  'Economic Management Sciences',
  'Technology',
  'Creative Arts',
  'Life Orientation',
];

export const GRADE_10_12_SUBJECTS: string[] = [
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
  'Life Orientation',
];

export const GRADES: number[] = [9, 10, 11, 12];
export const YEARS: number[] = [2026, 2025, 2024, 2023];
export const PAPER_TYPES: string[] = ['P1', 'P2', 'Memo', 'Study Guide'];

export const SUBJECT_ICONS: Record<string, string> = {
  'Mathematics': 'Calculator',
  'Mathematical Literacy': 'Calculator',
  'Physical Sciences': 'Atom',
  'Life Sciences': 'Dna',
  'Natural Sciences': 'Microscope',
  'Social Sciences': 'Globe',
  'Economic Management Sciences': 'Briefcase',
  'Technology': 'Wrench',
  'Creative Arts': 'Palette',
  'Life Orientation': 'HeartPulse',
  'Accounting': 'Landmark',
  'Business Studies': 'Briefcase',
  'Geography': 'Globe',
  'History': 'ScrollText',
  'Agricultural Sciences': 'Wheat',
  'Consumer Studies': 'ShoppingBasket',
};

export const DIFFICULTIES: string[] = ['Easy', 'Medium', 'Hard'];

export const ADMIN_PASSWORD = 'mzansi2026';

export const REWARDS = [
  { id: 'study-guide', name: 'Study Guide PDF', cost: 200, icon: 'BookOpen', desc: 'Download a premium study guide' },
  { id: 'airtime-10', name: 'Airtime R10', cost: 500, icon: 'Smartphone', desc: 'R10 airtime voucher' },
  { id: 'data-1gb', name: 'Data 1GB', cost: 1000, icon: 'Wifi', desc: '1GB data bundle' },
];

export const getTier = (points: number) => {
  if (points >= 1500) return { name: 'Gold', min: 1500, max: 3000, color: '#FFD600' };
  if (points >= 500) return { name: 'Silver', min: 500, max: 1499, color: '#C0C0C0' };
  return { name: 'Bronze', min: 0, max: 500, color: '#B45309' };
};
