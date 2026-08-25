'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useProfile } from '@/lib/useProfile';

interface ProfileContextValue {
    userId: string | null;
    profile: { displayName: string; avatarSeed: string } | null;
    needsName: boolean;
    loading: boolean;
    saveName: (name: string) => Promise<void>;
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
