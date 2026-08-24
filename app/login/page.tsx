'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { track, identifyUser, ANALYTICS_EVENTS } from '@/lib/analytics';

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (mode === 'signup') {
            track(ANALYTICS_EVENTS.SIGNUP_ATTEMPTED);
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) {
                setError(error.message);
                track(ANALYTICS_EVENTS.AUTH_FAILED, { mode: 'signup', error: error.message });
            } else {
                track(ANALYTICS_EVENTS.AUTH_SUCCESS, { mode: 'signup' });
                if (data.user) identifyUser(data.user.id, { email, auth_type: 'email' });
                router.push('/');
                router.refresh();
            }
        } else {
            track(ANALYTICS_EVENTS.LOGIN_ATTEMPTED);
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setError(error.message);
                track(ANALYTICS_EVENTS.AUTH_FAILED, { mode: 'login', error: error.message });
            } else {
                track(ANALYTICS_EVENTS.AUTH_SUCCESS, { mode: 'login' });
                if (data.user) identifyUser(data.user.id, { email, auth_type: 'email' });
                router.push('/');
                router.refresh();
            }
        }

        setLoading(false);
    }

    return (
        <main className="w-full max-w-sm mx-auto px-4 pt-16 pb-12">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-1 font-headline tracking-tighter text-3xl">
                    <span className="font-extrabold text-primary">CRICKET</span>
                    <span className="text-secondary font-black italic">007</span>
                </div>
                <p className="font-body-md text-sm text-on-surface-variant mt-2">
                    {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    minLength={6}
                    className="px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />

                {error && (
                    <p className="text-xs text-live font-body-md">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white font-headline font-bold text-sm py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                >
                    {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Sign Up'}
                </button>
            </form>

            <p className="text-center text-xs text-on-surface-variant font-body-md mt-6">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-secondary font-bold hover:underline"
                >
                    {mode === 'login' ? 'Sign up' : 'Log in'}
                </button>
            </p>
        </main>
    );
}