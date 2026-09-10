'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useProfile } from '@/lib/useProfile';

interface ProfileContextValue {
    userId: string | null;
    profile: { displayName: string; avatarSeed: string } | null;
    needsName: boolean;
    loading: boolean;
    coins: number;
    streak: number;
    maxStreak: number;
    saveName: (name: string) => Promise<void>;
    updateWallet: (data: { coins?: number; streak?: number; max_streak?: number }) => void;
    refreshWallet: () => Promise<void>;
    addCoins: (amount: number) => Promise<void>;
    spendCoins: (amount: number) => Promise<boolean>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
    const value = useProfile();
    return <ProfileContext value={value}>{children}</ProfileContext>;
}

export function useProfileContext(): ProfileContextValue {
    const ctx = useContext(ProfileContext);
    if (!ctx) {
        throw new Error('useProfileContext must be used within a ProfileProvider');
    }
    return ctx;
}
