'use client';

import { useEffect } from 'react';
import { useProfileContext } from '@/app/_components/ProfileProvider';
import { trackProfileView } from '@/lib/analytics';

export default function ProfilePage() {
  const { profile, coins, streak, loading } = useProfileContext();

  useEffect(() => {
    if (profile) {
      trackProfileView(profile.displayName);
    }
  }, [profile]);

  if (!profile) {
    return (
      <main className="w-full max-w-md mx-auto px-4 pt-10 pb-12 text-center">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 flex flex-col items-center text-center shadow-sm">
          <p className="text-base font-bold text-on-surface font-headline mb-2">No Profile Set</p>
          <p className="text-xs text-on-surface-variant font-body-md">
            Please enter your name on the home page or refresh to create your player profile.
          </p>
        </div>
      </main>
    );
  }

  const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(profile.avatarSeed)}`;

  return (
    <main className="w-full max-w-md mx-auto px-4 pt-10 pb-12">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 flex flex-col items-center text-center shadow-sm">
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-secondary/30 mb-4 shadow-md">
          <img src={avatarUrl} alt="Your avatar" className="w-full h-full object-cover" />
        </div>
        <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-6">
          {profile.displayName}
        </h1>

        {/* Real-time Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-tertiary-container mb-1">
              <span className="material-symbols-outlined text-2xl" aria-hidden="true">
                local_fire_department
              </span>
              <span className="font-headline font-black text-2xl text-on-surface">
                {streak}
              </span>
            </div>
            <span className="font-headline font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
              Daily Streak
            </span>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-secondary mb-1">
              <span className="material-symbols-outlined text-2xl" aria-hidden="true">
                toll
              </span>
              <span className="font-headline font-black text-2xl text-on-surface">
                {coins.toLocaleString()}
              </span>
            </div>
            <span className="font-headline font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
              Total Coins
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}