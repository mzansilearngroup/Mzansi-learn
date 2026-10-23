import { supabase, type User } from './supabase';

const STORAGE_KEY = 'mzansi_user';
const PROFILE_KEY = 'mzansi_profile';

export type LocalProfile = {
  id?: string;
  name: string;
  grade: number;
  school?: string;
  phone: string;
  points: number;
  avatar?: string;
};

export function getLocalProfile(): LocalProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalProfile;
  } catch {
    return null;
  }
}

export function saveLocalProfile(p: LocalProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function getLocalPhone(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setLocalPhone(phone: string) {
  localStorage.setItem(STORAGE_KEY, phone);
}

const AVATARS = ['🦁', '🐯', '🦅', '🐘', '🦓', '🦛', '🦒', '🐅', '🐆', '🦏', '🐊', '🎓', '📚', '✏️', '🧠'];

export async function loadOrCreateUser(phone: string, name?: string, grade?: number): Promise<User | null> {
  if (!phone) return null;
  const { data } = await supabase.from('users').select('*').eq('phone', phone).maybeSingle();
  if (data) return data as User;

  const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const insert = {
    name: name || 'Learner',
    grade: grade || 10,
    phone,
    points: 0,
    avatar,
  };
  const { data: created } = await supabase.from('users').insert(insert).select().single();
  return (created as User) ?? null;
}

export async function updateUserProfile(
  id: string,
  fields: Partial<Pick<User, 'name' | 'grade' | 'school' | 'avatar'>>
): Promise<User | null> {
  const { data } = await supabase.from('users').update(fields).eq('id', id).select().single();
  return (data as User) ?? null;
}

export async function addPoints(userId: string, points: number): Promise<number> {
  const { data } = await supabase.rpc('increment_user_points', { p_user_id: userId, p_points: points }).maybeSingle();
  if (data !== null && data !== undefined) return data as number;
  // fallback: read + update
  const { data: u } = await supabase.from('users').select('points').eq('id', userId).maybeSingle();
  const newPoints = (u?.points || 0) + points;
  await supabase.from('users').update({ points: newPoints }).eq('id', userId);
  return newPoints;
}
