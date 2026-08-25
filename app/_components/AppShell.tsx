'use client';

import { useProfileContext } from './ProfileProvider';
import NameGate from './NameGate';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { needsName, loading, saveName } = useProfileContext();

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