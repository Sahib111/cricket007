'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { getMatchStatusLabel, getMatchWinner } from './matchHelpers';
import type { MatchSummary } from './cricapi';
import type { User } from '@supabase/supabase-js';

interface Wallet {
    coins: number;
    streak: number;
}

const PREDICTION_REWARD = 100;

async function settlePendingPredictions(userId: string) {
    const { data: pending } = await supabase
        .from('predictions')
        .select('id, match_id, predicted_team')
        .eq('user_id', userId)
        .eq('status', 'pending');

    if (!pending || pending.length === 0) return;

    let matches: MatchSummary[] = [];
    try {
        const res = await fetch('/api/matches');
        const data = await res.json();
        matches = data.matches ?? [];
    } catch {
        return;
    }

    let coinsWon = 0;

    for (const pred of pending) {
        const match = matches.find((m) => m.id === pred.match_id);
        if (!match || getMatchStatusLabel(match) !== 'result') continue;

        const winner = getMatchWinner(match);

        if (!winner) {
            await supabase.from('predictions').update({ status: 'void' }).eq('id', pred.id);
            continue;
        }

        const won = winner.toLowerCase() === pred.predicted_team.toLowerCase();
        await supabase
            .from('predictions')
            .update({ status: won ? 'won' : 'lost' })
            .eq('id', pred.id);

        if (won) coinsWon += PREDICTION_REWARD;
    }

    if (coinsWon > 0) {
        const { data: current } = await supabase
            .from('wallets')
            .select('coins')
            .eq('user_id', userId)
            .single();

        if (current) {
            await supabase
                .from('wallets')
                .update({ coins: current.coins + coinsWon })
                .eq('user_id', userId);
        }
    }
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
    ]);
}

async function fetchSupabaseWallet(userId: string) {
    try {
        const { data } = await supabase
            .from('wallets')
            .select('coins, streak')
            .eq('user_id', userId)
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

export function useWallet() {
    const [user, setUser] = useState<User | null>(null);
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [loading, setLoading] = useState(true);

    async function fetchWallet(userId: string) {
        try {
            const data = await withTimeout(fetchSupabaseWallet(userId), 2000, null);
            if (data) setWallet(data);
        } catch (e) {
            console.error('Error fetching wallet:', e);
        }
    }

    async function loadAndSettle(userId: string) {
        try {
            await fetchWallet(userId);
            await settlePendingPredictions(userId);
            await fetchWallet(userId); // re-fetch in case coins were awarded
        } catch (e) {
            console.error('Error settling predictions:', e);
        }
    }

    useEffect(() => {
        let mounted = true;

        const checkAuth = async () => {
            try {
                const session = await withTimeout(fetchAuthSession(), 1500, null);

                if (mounted && session?.user) {
                    setUser(session.user);
                    loadAndSettle(session.user.id);
                }
            } catch (e) {
                console.error('Auth error in useWallet:', e);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        checkAuth();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) return;
            setUser(session?.user ?? null);
            if (session?.user) {
                loadAndSettle(session.user.id);
            } else {
                setWallet(null);
            }
        });

        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    async function refreshWallet() {
        if (user) await fetchWallet(user.id);
    }

    async function addCoins(amount: number) {
        if (!user || !wallet) return;
        const newCoins = wallet.coins + amount;
        const { error } = await supabase
            .from('wallets')
            .update({ coins: newCoins })
            .eq('user_id', user.id);

        if (!error) setWallet({ ...wallet, coins: newCoins });
    }

    async function spendCoins(amount: number): Promise<boolean> {
        if (!user || !wallet || wallet.coins < amount) return false;
        const newCoins = wallet.coins - amount;
        const { error } = await supabase
            .from('wallets')
            .update({ coins: newCoins })
            .eq('user_id', user.id);

        if (!error) {
            setWallet({ ...wallet, coins: newCoins });
            return true;
        }
        return false;
    }

    return { user, wallet, loading, refreshWallet, addCoins, spendCoins };
}