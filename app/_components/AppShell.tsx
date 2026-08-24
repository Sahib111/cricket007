'use client';

import { useProfile } from '@/lib/useProfile';
import NameGate from './NameGate';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { needsName, loading, saveName } = useProfile();

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center py-20">
                <p className="text-sm text-on-surface-variant font-body-md">Loading...</p>
            </div>
        );
    }

    return (
        <>
            {needsName && <NameGate onSubmit={saveName} />}
            {children}
        </>
    );
}