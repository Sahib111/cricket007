'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfileContext } from './ProfileProvider';
import { trackSuggestModalOpen, trackGameSuggestionSubmit } from '@/lib/analytics';

interface SuggestGameModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SuggestGameModal({ isOpen, onClose }: SuggestGameModalProps) {
    const { userId } = useProfileContext();
    const [suggestionText, setSuggestionText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSuggestionText('');
            setSubmitError(null);
            setSubmitted(false);
            trackSuggestModalOpen();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    async function handleSubmitSuggestion() {
        const trimmed = suggestionText.trim();
        if (!trimmed) {
            setSubmitError('Please write a suggestion before submitting.');
            return;
        }
        if (!userId) {
            setSubmitError('Could not identify your account — try reloading the page.');
            return;
        }

        setSubmitting(true);
        setSubmitError(null);

        const { error } = await supabase.from('game_suggestions').insert({
            user_id: userId,
            suggestion: trimmed,
        });

        setSubmitting(false);

        if (error) {
            console.error('Failed to save suggestion:', error);
            setSubmitError('Something went wrong — please try again.');
            return;
        }

        setSubmitted(true);
        setSuggestionText('');
        trackGameSuggestionSubmit(trimmed.length);
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={onClose}
        >
            <div
                className="bg-surface-container-lowest rounded-2xl shadow-lg max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {submitted ? (
                    <div className="text-center py-4">
                        <span className="material-symbols-outlined text-4xl text-pitch-green mb-2">
                            check_circle
                        </span>
                        <h3 className="font-headline font-bold text-lg text-on-surface mb-1">
                            Thanks for the idea!
                        </h3>
                        <p className="font-body-md text-sm text-on-surface-variant mb-4">
                            We've noted your suggestion.
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-primary text-white font-headline font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-all"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <h3 className="font-headline font-bold text-lg text-on-surface mb-1">
                            Suggest a Game
                        </h3>
                        <p className="font-body-md text-sm text-on-surface-variant mb-4">
                            What minigame should we build next?
                        </p>
                        <textarea
                            value={suggestionText}
                            onChange={(e) => setSuggestionText(e.target.value)}
                            placeholder="e.g. A trivia quiz about World Cup history..."
                            rows={4}
                            disabled={submitting}
                            className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container text-sm font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50"
                        />
                        {submitError && (
                            <p className="text-xs text-live font-body-md mt-2">{submitError}</p>
                        )}
                        <div className="flex gap-3 mt-4 justify-end">
                            <button
                                onClick={onClose}
                                disabled={submitting}
                                className="px-4 py-2 rounded-lg border border-outline-variant font-headline font-bold text-sm text-on-surface hover:bg-surface-container transition-all disabled:opacity-40"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitSuggestion}
                                disabled={submitting}
                                className="px-5 py-2 rounded-lg bg-primary text-white font-headline font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40"
                            >
                                {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
