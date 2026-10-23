import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, type User } from '@/lib/supabase';
import {
  getLocalProfile,
  saveLocalProfile,
  getLocalPhone,
  setLocalPhone,
  loadOrCreateUser,
  type LocalProfile,
} from '@/lib/userStore';

type Ctx = {
  user: User | null;
  profile: LocalProfile | null;
  loading: boolean;
  setPhone: (phone: string) => Promise<void>;
  saveProfile: (p: LocalProfile) => Promise<void>;
  refreshUser: () => Promise<void>;
  addPoints: (points: number) => Promise<void>;
};

const UserContext = createContext<Ctx | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const local = getLocalProfile();
      const phone = getLocalPhone();
      if (local) setProfile(local);
      if (phone) {
        const u = await loadOrCreateUser(phone, local?.name, local?.grade);
        if (u) {
          setUser(u);
          const merged: LocalProfile = {
            id: u.id,
            name: u.name,
            grade: u.grade,
            school: u.school ?? local?.school,
            phone: u.phone ?? phone,
            points: u.points,
            avatar: u.avatar ?? undefined,
          };
          setProfile(merged);
          saveLocalProfile(merged);
        }
      }
      setLoading(false);
    })();
  }, []);

  const setPhone = async (phone: string) => {
    setLocalPhone(phone);
    const u = await loadOrCreateUser(phone, profile?.name, profile?.grade);
    if (u) {
      setUser(u);
      const merged: LocalProfile = {
        id: u.id,
        name: u.name,
        grade: u.grade,
        school: profile?.school,
        phone: u.phone ?? phone,
        points: u.points,
        avatar: u.avatar ?? undefined,
      };
      setProfile(merged);
      saveLocalProfile(merged);
    }
  };

  const saveProfile = async (p: LocalProfile) => {
    saveLocalProfile(p);
    setProfile(p);
    if (p.id) {
      const { data } = await supabase
        .from('users')
        .update({ name: p.name, grade: p.grade, school: p.school, avatar: p.avatar })
        .eq('id', p.id)
        .select()
        .single();
      if (data) setUser(data as User);
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    const { data } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
    if (data) {
      setUser(data as User);
      const merged: LocalProfile = {
        ...profile!,
        id: data.id,
        name: data.name,
        grade: data.grade,
        school: data.school ?? undefined,
        points: data.points,
        avatar: data.avatar ?? undefined,
      };
      setProfile(merged);
      saveLocalProfile(merged);
    }
  };

  const addPoints = async (points: number) => {
    if (!user) {
      // localStorage fallback
      if (profile) {
        const updated = { ...profile, points: profile.points + points };
        saveLocalProfile(updated);
        setProfile(updated);
      }
      return;
    }
    const { data } = await supabase.rpc('increment_user_points', { p_user_id: user.id, p_points: points }).maybeSingle();
    if (data !== null && data !== undefined) {
      const newPoints = data as number;
      const updated = { ...user, points: newPoints };
      setUser(updated);
      if (profile) {
        const merged = { ...profile, points: newPoints };
        setProfile(merged);
        saveLocalProfile(merged);
      }
    }
  };

  return (
    <UserContext.Provider value={{ user, profile, loading, setPhone, saveProfile, refreshUser, addPoints }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
