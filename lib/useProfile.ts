'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { identifyUser, track, ANALYTICS_EVENTS } from './analytics';

const AVATAR_SEEDS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const STARTING_COINS = 100;
const LOCAL_NAME_KEY = 'cricket007_user_name';
const LOCAL_SEED_KEY = 'cricket007_avatar_seed';

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
        let localName = '';
        let localSeed = '';
        try {
            localName = localStorage.getItem(LOCAL_NAME_KEY) || '';
            localSeed = localStorage.getItem(LOCAL_SEED_KEY) || '';
        } catch (e) { }

        if (localName) {
            setProfile({ displayName: localName, avatarSeed: localSeed || '1' });
            setNeedsName(false);
        }

        let uid: string | undefined;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            uid = session?.user?.id;

            if (!uid) {
                const { data, error } = await supabase.auth.signInAnonymously();
                if (!error && data?.user) {
                    uid = data.user.id;
                }
            }
        } catch (e) {
            console.error('Supabase auth init error:', e);
        }

        if (uid) {
            setUserId(uid);

            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('display_name, avatar_seed')
                .eq('user_id', uid)
                .single();

            if (existingProfile) {
                setProfile({ displayName: existingProfile.display_name, avatarSeed: existingProfile.avatar_seed });
                setNeedsName(false);
                try {
                    localStorage.setItem(LOCAL_NAME_KEY, existingProfile.display_name);
                    localStorage.setItem(LOCAL_SEED_KEY, existingProfile.avatar_seed);
                } catch (e) { }

                identifyUser(uid, {
                    auth_type: 'anonymous',
                    display_name: existingProfile.display_name,
                    avatar_seed: existingProfile.avatar_seed,
                });
            } else {
                identifyUser(uid, { auth_type: 'anonymous' });
                if (!localName) {
                    setNeedsName(true);
                }
            }
        } else if (!localName) {
            setNeedsName(true);
        }

        setLoading(false);
    }

    async function saveName(name: string) {
        const cleanName = name.trim();
        if (!cleanName) return;

        const avatarSeed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)];

        // 1. Immediately update React state so the modal closes instantly
        setProfile({ displayName: cleanName, avatarSeed });
        setNeedsName(false);

        // 2. Instantly persist to localStorage
        try {
            localStorage.setItem(LOCAL_NAME_KEY, cleanName);
            localStorage.setItem(LOCAL_SEED_KEY, avatarSeed);
        } catch (e) { }

        // 3. Track name submission
        track(ANALYTICS_EVENTS.NAME_SUBMITTED, { display_name: cleanName });

        let currentUid = userId;
        if (!currentUid) {
            try {
                const { data } = await supabase.auth.signInAnonymously();
                if (data?.user) {
                    currentUid = data.user.id;
                    setUserId(currentUid);
                }
            } catch (e) { }
        }

        if (currentUid) {
            identifyUser(currentUid, { display_name: cleanName, avatar_seed: avatarSeed });

            // 4. Save to Supabase using upsert (non-blocking)
            try {
                await supabase
                    .from('profiles')
                    .upsert(
                        { user_id: currentUid, display_name: cleanName, avatar_seed: avatarSeed },
                        { onConflict: 'user_id' }
                    );

                await supabase
                    .from('wallets')
                    .upsert(
                        { user_id: currentUid, coins: STARTING_COINS, streak: 0 },
                        { onConflict: 'user_id', ignoreDuplicates: true }
                    );

                track(ANALYTICS_EVENTS.COINS_EARNED, {
                    amount: STARTING_COINS,
                    source: 'signup_bonus',
                });
            } catch (err) {
                console.error('Failed to sync profile to database:', err);
            }
        }
    }

    return { userId, profile, needsName, loading, saveName };
}