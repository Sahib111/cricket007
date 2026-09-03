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
    const [coins, setCoins] = useState<number>(0);
    const [streak, setStreak] = useState<number>(0);

    const updateWallet = (data: { coins?: number; streak?: number }) => {
        if (typeof data.coins === 'number') {
            setCoins(data.coins);
        }
        if (typeof data.streak === 'number') {
            setStreak(data.streak);
        }
        if (typeof window !== 'undefined') {
            window.dispatchEvent(
                new CustomEvent('cricket007:wallet_update', {
                    detail: { coins: data.coins, streak: data.streak },
                })
            );
        }
    };

    const fetchWallet = async (uid: string) => {
        try {
            const { data } = await supabase
                .from('wallets')
                .select('coins, streak')
                .eq('user_id', uid)
                .maybeSingle();

            if (data) {
                if (typeof data.coins === 'number') setCoins(data.coins);
                if (typeof data.streak === 'number') setStreak(data.streak);
            }
        } catch (e) {
            console.error('Error fetching wallet:', e);
        }
    };

    const refreshWallet = async () => {
        if (userId) {
            await fetchWallet(userId);
        }
    };

    useEffect(() => {
        init();
    }, []);

    // Setup Supabase Realtime subscription and window event listeners when userId is resolved
    useEffect(() => {
        if (!userId) return;

        // 1. Initial wallet fetch
        fetchWallet(userId);

        // 2. Window focus refresh
        const handleFocus = () => {
            fetchWallet(userId);
        };
        window.addEventListener('focus', handleFocus);

        // 3. Local custom event listener for 0ms cross-component instant sync
        const handleCustomUpdate = (e: Event) => {
            const customEvent = e as CustomEvent<{ coins?: number; streak?: number }>;
            if (customEvent.detail) {
                if (typeof customEvent.detail.coins === 'number') {
                    setCoins(customEvent.detail.coins);
                }
                if (typeof customEvent.detail.streak === 'number') {
                    setStreak(customEvent.detail.streak);
                }
            }
        };
        window.addEventListener('cricket007:wallet_update', handleCustomUpdate);

        // 4. Supabase Realtime Postgres Changes Subscription
        const channel = supabase
            .channel(`wallets-realtime-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'wallets',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    if (payload.new && typeof payload.new === 'object') {
                        const newRow = payload.new as { coins?: number; streak?: number };
                        if (typeof newRow.coins === 'number') {
                            setCoins(newRow.coins);
                        }
                        if (typeof newRow.streak === 'number') {
                            setStreak(newRow.streak);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('cricket007:wallet_update', handleCustomUpdate);
            supabase.removeChannel(channel);
        };
    }, [userId]);

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
        setCoins(STARTING_COINS);
        setStreak(0);
        updateWallet({ coins: STARTING_COINS, streak: 0 });

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

    async function addCoins(amount: number) {
        if (!userId) return;
        const newCoins = coins + amount;
        updateWallet({ coins: newCoins });
        try {
            await supabase
                .from('wallets')
                .update({ coins: newCoins })
                .eq('user_id', userId);
        } catch (e) {
            console.error('Error adding coins:', e);
        }
    }

    async function spendCoins(amount: number): Promise<boolean> {
        if (!userId || coins < amount) return false;
        const newCoins = coins - amount;
        updateWallet({ coins: newCoins });
        try {
            const { error } = await supabase
                .from('wallets')
                .update({ coins: newCoins })
                .eq('user_id', userId);
            if (error) {
                // rollback on error
                refreshWallet();
                return false;
            }
            return true;
        } catch (e) {
            console.error('Error spending coins:', e);
            refreshWallet();
            return false;
        }
    }

    return { userId, profile, needsName, loading, coins, streak, saveName, updateWallet, refreshWallet, addCoins, spendCoins };
}