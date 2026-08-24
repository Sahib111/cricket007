'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_PLAYER = {
  name: 'Sachin Tendulkar',
  role: 'Legendary Batsman',
  country: 'India 🇮🇳',
  aliases: ['sachin', 'tendulkar', 'sachin tendulkar', 'master blaster'],
  hints: [
    'Known as the "Master Blaster" and played 200 Test matches.',
    'Only cricketer to score 100 international centuries.',
    'Made international debut at age 16 against Pakistan in 1989.',
    'Part of India\'s 2011 ICC Cricket World Cup winning team.',
    'Wore the iconic Jersey No. 10 for India in ODIs.',
  ],
};

const POINTS_TABLE = [50, 40, 30, 20, 10]; // index 0 = hint 1 (50 pts), etc.

export default function GuessCricketerGame() {
  const [hintIndex, setHintIndex] = useState<number>(0); // 0-indexed (0 = Hint 1)
  const [userGuess, setUserGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'error' | 'success' | null }>({
    message: '',
    type: null,
  });
  const [gameState, setGameState] = useState<'PLAYING' | 'WON' | 'GAVE_UP'>('PLAYING');
  const [score, setScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<string[]>([]);

  const currentHintNumber = hintIndex + 1; // 1 to 5
  const potentialPoints = POINTS_TABLE[hintIndex];

  function handleNextHint() {
    if (hintIndex < DUMMY_PLAYER.hints.length - 1) {
      setHintIndex((prev) => prev + 1);
      setFeedback({ message: '', type: null });
    }
  }

  function handleGuessSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = userGuess.trim().toLowerCase();

    if (!trimmed) return;

    setAttempts((prev) => [...prev, userGuess.trim()]);

    // Check if guess matches full name or aliases
    const isCorrect = DUMMY_PLAYER.aliases.some(
      (alias) => alias.toLowerCase() === trimmed
    );

    if (isCorrect) {
      const earned = POINTS_TABLE[hintIndex];
      setScore(earned);
      setGameState('WON');
      setFeedback({
        message: `🎉 Correct! It is ${DUMMY_PLAYER.name}! You scored ${earned} points!`,
        type: 'success',
      });
    } else {
      setUserGuess('');
      setFeedback({
        message: `❌ "${userGuess.trim()}" is incorrect. Try again or unlock another hint!`,
        type: 'error',
      });
    }
  }

  function handleGiveUp() {
    setGameState('GAVE_UP');
    setScore(0);
  }

  function handleReset() {
    setHintIndex(0);
    setUserGuess('');
    setFeedback({ message: '', type: null });
    setGameState('PLAYING');
    setScore(0);
    setAttempts([]);
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">

      {/* ── Potential Points Header ── */}
      <div className="flex items-center justify-between rounded-2xl border border-orange-700/40 bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-zinc-900 p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">🏏</span>
          <div>
            <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
              Guess The Cricketer
            </p>
            <p className="text-xs text-zinc-400">
              Fewer hints = More points
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-zinc-400 block">Current Reward</span>
          <span className="text-lg font-black text-amber-300">
            +{potentialPoints} Pts
          </span>
        </div>
      </div>

      {/* ── Game Card ── */}
      {gameState === 'PLAYING' ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl space-y-5">

          {/* Hint Progress Counter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Hint Counter
              </span>
              <span className="rounded-full bg-orange-500/20 px-2.5 py-0.5 text-xs font-bold text-orange-400 border border-orange-500/30">
                {currentHintNumber} of 5
              </span>
            </div>

            <span className="text-xs text-zinc-500 font-medium">
              Value: {potentialPoints} pts
            </span>
          </div>

          {/* Revealed Hints Stack */}
          <div className="space-y-2">
            {DUMMY_PLAYER.hints.slice(0, currentHintNumber).map((hint, idx) => (
              <div
                key={idx}
                className={[
                  'rounded-xl border p-3 text-xs transition-all duration-300',
                  idx === hintIndex
                    ? 'border-amber-500/40 bg-amber-950/30 text-amber-100 font-medium shadow-md'
                    : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 opacity-80',
                ].join(' ')}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase text-amber-400/80">
                    Hint #{idx + 1} ({POINTS_TABLE[idx]} pts)
                  </span>
                </div>
                <p className="leading-relaxed">{hint}</p>
              </div>
            ))}
          </div>

          {/* Next Hint Button */}
          {currentHintNumber < 5 && (
            <button
              id="btn-next-hint"
              type="button"
              onClick={handleNextHint}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-600/40 bg-amber-500/10 py-2.5 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-500/20 active:scale-[0.98]"
            >
              <span>💡 Reveal Next Hint ({currentHintNumber + 1} of 5)</span>
              <span className="text-[10px] opacity-75">(-10 pts)</span>
            </button>
          )}

          {/* Feedback message */}
          {feedback.message && (
            <div
              className={`rounded-xl border p-3 text-xs text-center font-medium ${
                feedback.type === 'error'
                  ? 'border-rose-700/50 bg-rose-950/40 text-rose-300'
                  : 'border-emerald-700/50 bg-emerald-950/40 text-emerald-300'
              }`}
              role="alert"
            >
              {feedback.message}
            </div>
          )}

          {/* Guess Input Form */}
          <form onSubmit={handleGuessSubmit} className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="guess-input" className="text-xs font-semibold text-zinc-300">
                Enter your guess:
              </label>
              <input
                id="guess-input"
                type="text"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                placeholder="e.g. Sachin Tendulkar"
                autoComplete="off"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex gap-2">
              <button
                id="btn-submit-guess"
                type="submit"
                disabled={!userGuess.trim()}
                className={[
                  'flex-1 rounded-xl py-3 text-xs font-bold transition-all duration-150',
                  userGuess.trim()
                    ? 'bg-amber-400 text-zinc-950 hover:bg-amber-300 active:scale-[0.98] shadow-md shadow-amber-400/20'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed',
                ].join(' ')}
              >
                Submit Guess
              </button>

              <button
                id="btn-give-up"
                type="button"
                onClick={handleGiveUp}
                className="rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-3 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
              >
                Give Up
              </button>
            </div>
          </form>

          {/* Attempts counter */}
          {attempts.length > 0 && (
            <div className="text-center">
              <p className="text-[11px] text-zinc-500">
                Previous attempts ({attempts.length}): {attempts.join(', ')}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ── Result Screen ── */
        <div
          className={`rounded-2xl border p-6 text-center shadow-xl space-y-4 ${
            gameState === 'WON'
              ? 'border-emerald-600/50 bg-emerald-950/40 text-emerald-200'
              : 'border-zinc-800 bg-zinc-900 text-zinc-300'
          }`}
        >
          <span className="text-5xl block" aria-hidden="true">
            {gameState === 'WON' ? '🏆' : '🔍'}
          </span>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">
              {gameState === 'WON' ? 'Spot On!' : 'Better Luck Next Time!'}
            </h2>
            <p className="text-xs text-zinc-400">
              The player was <strong className="text-amber-300 font-bold text-base">{DUMMY_PLAYER.name}</strong> ({DUMMY_PLAYER.country})
            </p>
          </div>

          {/* Score breakdown */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Hint Stage Reached:</span>
              <span className="font-semibold text-white">Hint #{currentHintNumber} of 5</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Points Scored:</span>
              <span className="font-bold text-amber-400 text-sm">+{score} pts</span>
            </div>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button
              id="btn-play-again"
              onClick={handleReset}
              className="rounded-full bg-amber-400 px-6 py-2.5 text-xs font-bold text-zinc-950 transition-opacity hover:opacity-90 active:scale-95"
            >
              Play Again
            </button>
            <Link
              href="/"
              className="rounded-full border border-zinc-700 bg-zinc-800 px-6 py-2.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              Home
            </Link>
          </div>
        </div>
      )}

      {/* Points Legend Table */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
        <h3 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
          Points Scoring System
        </h3>
        <div className="grid grid-cols-5 gap-1 text-center">
          {POINTS_TABLE.map((pts, i) => (
            <div
              key={i}
              className={`rounded-lg p-2 border ${
                i === hintIndex && gameState === 'PLAYING'
                  ? 'border-amber-500/60 bg-amber-500/20 text-amber-300 font-bold'
                  : 'border-zinc-800 bg-zinc-950/40 text-zinc-400'
              }`}
            >
              <span className="text-[10px] block text-zinc-500">Hint {i + 1}</span>
              <span className="text-xs font-bold">{pts} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
