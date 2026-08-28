'use client';

import { useProfileContext } from './ProfileProvider';
import NameGate from './NameGate';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { needsName, saveName } = useProfileContext();

    return (
        <>
            {needsName && <NameGate onSubmit={saveName} />}
            {children}
        </>
    );
}