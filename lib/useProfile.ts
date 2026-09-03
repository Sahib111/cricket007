'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { identifyUser, trackNameSubmit, trackCoinsEarned } from './analytics';

const AVATAR_SEEDS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const STARTING_COINS = 100;
const LOCAL_NAME_KEY = 'cricket007_user_name';
const LOCAL_SEED_KEY = 'cricket007_avatar_seed';
const LOCAL_UID_KEY = 'cricket007_user_id';

interface Profile {
    displayName: string;
    avatarSeed: string;
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
    ]);
}

function getOrCreateLocalUserId(): string {
    try {
        let uid = localStorage.getItem(LOCAL_UID_KEY);
        if (!uid) {
            uid = typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : 'user_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
            localStorage.setItem(LOCAL_UID_KEY, uid);
        }
        return uid;
    } catch {
        return 'user_' + Math.random().toString(36).substring(2, 15);
    }
}

async function fetchSupabaseProfile(uid: string) {
    try {
        const { data } = await supabase
            .from('profiles')
            .select('display_name, avatar_seed')
            .eq('user_id', uid)
            .maybeSingle();
        return data;
    } catch {
        return null;
    }
}

async function fetchAuthSession() {
    try {
        const { data } = await supabase.auth.getSession();
        return data?.session ?? null;
    } catch {
        return null;
    }
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
        let localUid = '';

        try {
            localName = localStorage.getItem(LOCAL_NAME_KEY) || '';
            localSeed = localStorage.getItem(LOCAL_SEED_KEY) || '';
            localUid = getOrCreateLocalUserId();
        } catch (e) {
            console.error('Error reading localStorage:', e);
        }

        if (localUid) {
            setUserId(localUid);
        }

        if (localName) {
            setProfile({ displayName: localName, avatarSeed: localSeed || '1' });
            setNeedsName(false);
        } else {
            setNeedsName(true);
        }

        // Instantly mark loading as false so UI renders immediately
        setLoading(false);

        // Non-blocking background sync with Supabase
        try {
            let uid = localUid;

            const session = await withTimeout(fetchAuthSession(), 1500, null);

            if (session?.user?.id) {
                uid = session.user.id;
                setUserId(uid);
                try {
                    localStorage.setItem(LOCAL_UID_KEY, uid);
                } catch { }
            }

            if (uid) {
                const existingProfile = await withTimeout(fetchSupabaseProfile(uid), 2000, null);

                if (existingProfile?.display_name) {
                    setProfile({
                        displayName: existingProfile.display_name,
                        avatarSeed: existingProfile.avatar_seed || '1',
                    });
                    setNeedsName(false);
                    try {
                        localStorage.setItem(LOCAL_NAME_KEY, existingProfile.display_name);
                        localStorage.setItem(LOCAL_SEED_KEY, existingProfile.avatar_seed || '1');
                    } catch { }

                    identifyUser(uid, {
                        auth_type: 'anonymous',
                        display_name: existingProfile.display_name,
                        avatar_seed: existingProfile.avatar_seed,
                    });
                }
            }
        } catch (e) {
            console.error('Background profile sync error:', e);
        }
    }

    async function saveName(name: string) {
        const cleanName = name.trim();
        if (!cleanName) return;

        const avatarSeed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)];

        // 1. Immediately update React state so the modal closes instantly
        setProfile({ displayName: cleanName, avatarSeed });
        setNeedsName(false);

        // 2. Instantly persist to localStorage
        const currentUid = userId || getOrCreateLocalUserId();
        if (!userId) {
            setUserId(currentUid);
        }

        try {
            localStorage.setItem(LOCAL_NAME_KEY, cleanName);
            localStorage.setItem(LOCAL_SEED_KEY, avatarSeed);
            localStorage.setItem(LOCAL_UID_KEY, currentUid);
        } catch (e) { }

        // 3. Track name submission
        trackNameSubmit(cleanName);

        // 4. Non-blocking background sync to Supabase
        (async () => {
            try {
                identifyUser(currentUid, { display_name: cleanName, avatar_seed: avatarSeed });

                await withTimeout(
                    Promise.all([
                        supabase
                            .from('profiles')
                            .upsert(
                                { user_id: currentUid, display_name: cleanName, avatar_seed: avatarSeed },
                                { onConflict: 'user_id' }
                            ),
                        supabase
                            .from('wallets')
                            .upsert(
                                { user_id: currentUid, coins: STARTING_COINS, streak: 0 },
                                { onConflict: 'user_id', ignoreDuplicates: true }
                            ),
                    ]),
                    3000,
                    null
                );

                trackCoinsEarned(STARTING_COINS, 'signup_bonus');
            } catch (err) {
                console.error('Failed to sync profile to database:', err);
            }
        })();
    }

    return { userId, profile, needsName, loading, saveName };
}