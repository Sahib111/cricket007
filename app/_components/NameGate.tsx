'use client';

import { useState } from 'react';

export default function NameGate({ onSubmit }: { onSubmit: (name: string) => void }) {
    const [name, setName] = useState('');

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (name.trim().length >= 2) {
            onSubmit(name.trim());
        }
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-sm shadow-lg">
                <div className="text-center mb-5">
                    <div className="flex items-center justify-center gap-1 font-headline tracking-tighter text-2xl">
                        <span className="font-extrabold text-primary">CRICKET</span>
                        <span className="text-secondary font-black italic">007</span>
                    </div>
                    <p className="font-body-md text-sm text-on-surface-variant mt-2">
                        What should we call you?
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        autoFocus
                        minLength={2}
                        maxLength={20}
                        className="px-4 py-3 rounded-lg border border-outline-variant bg-surface-container text-sm font-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                        type="submit"
                        className="bg-primary text-white font-headline font-bold text-sm py-3 rounded-lg hover:opacity-90 transition-all"
                    >
                        Let's Go
                    </button>
                </form>
            </div>
        </div>
    );
}