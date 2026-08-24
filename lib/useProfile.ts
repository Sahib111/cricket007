'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { identifyUser, track, ANALYTICS_EVENTS } from './analytics';

const AVATAR_SEEDS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const STARTING_COINS = 100;

interface Profile {
    displayName: string;
    avatarSeed: string;
}

export function useProfile() {
    const [userId, setUserId] = useState<string | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [needsName, setNeedsName] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        init();
    }, []);

    async function init() {
        const { data: { session } } = await supabase.auth.getSession();

        let uid = session?.user?.id;

        if (!uid) {
            const { data, error } = await supabase.auth.signInAnonymously();
            if (error || !data.user) {
                setLoading(false);
                return;
            }
            uid = data.user.id;
        }

        setUserId(uid);

        // Identify the user in PostHog
        identifyUser(uid, { auth_type: 'anonymous' });

        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('display_name, avatar_seed')
            .eq('user_id', uid)
            .single();

        if (existingProfile) {
            setProfile({ displayName: existingProfile.display_name, avatarSeed: existingProfile.avatar_seed });

            // Re-identify with profile traits
            identifyUser(uid, {
                display_name: existingProfile.display_name,
                avatar_seed: existingProfile.avatar_seed,
            });
        } else {
            setNeedsName(true);
        }

        setLoading(false);
    }

    async function saveName(name: string) {
        if (!userId) return;
        const avatarSeed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)];

        const { error } = await supabase
            .from('profiles')
            .insert({ user_id: userId, display_name: name, avatar_seed: avatarSeed });

        if (!error) {
            setProfile({ displayName: name, avatarSeed });
            setNeedsName(false);

            // Track name submission and re-identify with profile info
            track(ANALYTICS_EVENTS.NAME_SUBMITTED, { display_name: name });
            identifyUser(userId, { display_name: name, avatar_seed: avatarSeed });

            // First-time login — give the new wallet a starting balance.
            // upsert avoids a duplicate-key error if a wallets row already exists for this user.
            await supabase
                .from('wallets')
                .upsert(
                    { user_id: userId, coins: STARTING_COINS, streak: 0 },
                    { onConflict: 'user_id', ignoreDuplicates: true }
                );

            track(ANALYTICS_EVENTS.COINS_EARNED, {
                amount: STARTING_COINS,
                source: 'signup_bonus',
            });
        }
    }

    return { userId, profile, needsName, loading, saveName };
}