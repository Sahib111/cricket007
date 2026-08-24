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

export function useWallet() {
    const [user, setUser] = useState<User | null>(null);
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [loading, setLoading] = useState(true);

    async function fetchWallet(userId: string) {
        const { data } = await supabase
            .from('wallets')
            .select('coins, streak')
            .eq('user_id', userId)
            .single();

        if (data) setWallet(data);
    }

    async function loadAndSettle(userId: string) {
        await fetchWallet(userId);
        await settlePendingPredictions(userId);
        await fetchWallet(userId); // re-fetch in case coins were awarded
    }

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            if (user) loadAndSettle(user.id);
            setLoading(false);
        });

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                loadAndSettle(session.user.id);
            } else {
                setWallet(null);
            }
        });

        return () => listener.subscription.unsubscribe();
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