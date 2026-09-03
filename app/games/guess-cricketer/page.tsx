'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfileContext } from '@/app/_components/ProfileProvider';
import { PUZZLES, type Puzzle, type Hint } from '@/lib/cricketerPuzzles';
import {
  trackGuessStart,
  trackGuessHintReveal,
  trackGuessSubmit,
  trackGuessCorrect,
  trackCoinsEarned,
  trackGuessIncorrect,
  trackGuessGameOver,
  trackGuessNextRound,
} from '@/lib/analytics';

function pickRandomPuzzle(excludeIndex?: number): number {
  let idx = Math.floor(Math.random() * PUZZLES.length);
  if (PUZZLES.length > 1 && idx === excludeIndex) {
    idx = (idx + 1) % PUZZLES.length;
  }
  return idx;
}

export default function GuessCricketerPage() {
  const { userId } = useProfileContext();
  const [puzzleIndex, setPuzzleIndex] = useState(0);

  useEffect(() => {
    const idx = pickRandomPuzzle();
    setPuzzleIndex(idx);
    trackGuessStart(PUZZLES[idx].answer);
  }, []);

  const [revealedCount, setRevealedCount] = useState(1);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [coinsWon, setCoinsWon] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [totalCoins, setTotalCoins] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);

  const puzzle = PUZZLES[puzzleIndex];

  function revealNextHint() {
    if (revealedCount < puzzle.hints.length && !gameOver) {
      const nextHint = revealedCount + 1;
      setRevealedCount(nextHint);
      trackGuessHintReveal(
        nextHint,
        puzzle.hints.length,
        puzzle.hints[nextHint - 1].reward
      );
    }
  }

  async function saveResult(status: 'won' | 'lost', hintUsed: number, reward: number) {
    if (!userId) return;

    await supabase.from('game_results').insert({
      user_id: userId,
      game: 'guess-cricketer',
      outcome: status,
      detail: { hint: hintUsed, answer: puzzle.answer },
      coins_earned: reward,
    });

    if (reward > 0) {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('coins')
        .eq('user_id', userId)
        .single();

      if (wallet) {
        await supabase
          .from('wallets')
          .update({ coins: wallet.coins + reward })
          .eq('user_id', userId);
      }
    }
  }

  function handleSubmit() {
    if (!answer.trim() || gameOver) return;

    const isCorrect = answer.trim().toUpperCase() === puzzle.answer;
    trackGuessSubmit(answer.trim(), isCorrect);

    if (isCorrect) {
      const reward = puzzle.hints[revealedCount - 1].reward;
      setCoinsWon(reward);
      setTotalCoins((prev) => prev + reward);
      setResult('correct');
      setGameOver(true);
      saveResult('won', revealedCount, reward);
      trackGuessCorrect(
        revealedCount,
        reward,
        puzzle.answer
      );
      trackCoinsEarned(reward, 'guess_cricketer');
    } else {
      setResult('incorrect');
      setAnswer('');
      trackGuessIncorrect(revealedCount);
      if (revealedCount >= puzzle.hints.length) {
        setGameOver(true);
        saveResult('lost', revealedCount, 0);
        trackGuessGameOver(puzzle.answer, revealedCount);
      }
    }
  }

  function playNextRound() {
    const nextIndex = pickRandomPuzzle(puzzleIndex);
    setPuzzleIndex(nextIndex);
    setRevealedCount(1);
    setAnswer('');
    setResult(null);
    setCoinsWon(null);
    setGameOver(false);
    setRoundsPlayed((prev) => prev + 1);
    trackGuessNextRound(
      roundsPlayed + 2,
      totalCoins,
      PUZZLES[nextIndex].answer
    );
  }

  return (
    <main className="w-full max-w-[700px] mx-auto px-4 md:px-6 pt-6 sm:pt-8 pb-12">
      {/* Banner */}
      <div className="relative rounded-xl overflow-hidden h-[140px] sm:h-[160px] mb-4 bg-gradient-to-br from-secondary/20 to-secondary/5 border border-outline-variant flex items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-secondary opacity-30 absolute">
          travel_explore
        </span>
        <h1 className="relative font-headline font-extrabold text-2xl sm:text-3xl text-secondary text-center tracking-wide uppercase">
          Guess the Cricketer
        </h1>
      </div>

      {/* Session summary */}
      {roundsPlayed > 0 && (
        <div className="flex justify-between items-center mb-4 px-1">
          <span className="text-xs font-mono-code text-on-surface-variant">
            Round {roundsPlayed + 1}
          </span>
          <span className="text-xs font-mono-code font-bold text-pitch-green">
            🪙 {totalCoins} total coins won this session
          </span>
        </div>
      )}

      {/* Riddle Box */}
      <div className="bg-surface-container-lowest border border-outline-variant border-l-4 border-l-primary rounded-xl p-5 mb-6 shadow-sm">
        <p className="text-[10px] font-mono-code font-bold text-on-surface-variant tracking-widest uppercase mb-2 text-center">
          Mystery Riddle
        </p>
        <p className="font-body-md text-sm text-on-surface text-center italic">
          {puzzle.riddle}
        </p>
      </div>

      {/* Hints Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-headline font-bold text-on-surface-variant">
          Available Hints
        </span>
        <span className="text-xs font-mono-code text-on-surface-variant">
          Reward decreases per hint
        </span>
      </div>

      {/* Hints List */}
      <div className="flex flex-col gap-2.5 mb-6">
        {puzzle.hints.map((hint, i) => {
          const hintNumber = i + 1;
          const isRevealed = hintNumber <= revealedCount;
          const isNext = hintNumber === revealedCount + 1;

          return (
            <div
              key={i}
              className={`flex items-center justify-between rounded-lg px-4 py-3 border ${isRevealed
                ? 'bg-primary/5 border-primary/30'
                : 'bg-surface-container border-outline-variant'
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-on-surface-variant">
                  {isRevealed ? 'location_on' : 'lock'}
                </span>
                <div>
                  {isRevealed ? (
                    <>
                      <p className="text-[10px] font-mono-code font-bold text-primary uppercase tracking-wide">
                        Hint {hintNumber} · Revealed
                      </p>
                      <p className="font-body-md text-sm text-on-surface">{hint.text}</p>
                    </>
                  ) : (
                    <p className="font-body-md text-sm text-on-surface-variant">
                      {hintNumber === puzzle.hints.length ? 'Reveal Final Hint' : `Reveal Hint ${hintNumber}`}
                    </p>
                  )}
                </div>
              </div>

              {isRevealed ? (
                <span className="flex items-center gap-1 text-pitch-green text-xs font-bold font-mono-code">
                  🪙 {hint.reward}
                </span>
              ) : isNext ? (
                <button
                  onClick={revealNextHint}
                  disabled={gameOver}
                  className="flex items-center gap-1 bg-secondary text-white text-xs font-bold font-mono-code px-3 py-1.5 rounded-full hover:opacity-90 transition-all disabled:opacity-40"
                >
                  Unlock
                </button>
              ) : (
                <span className="flex items-center gap-1 text-on-surface-variant text-xs font-bold font-mono-code opacity-50">
                  🪙 {hint.reward}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Answer Box */}
      <div>
        <label className="text-xs font-headline font-bold text-secondary block mb-2">
          Your Answer
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter Player Name"
            disabled={gameOver}
            className="flex-1 px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest font-body-md text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={gameOver}
            className="flex items-center gap-1 bg-secondary text-white font-headline font-bold text-sm px-5 py-3 rounded-lg hover:opacity-90 transition-all whitespace-nowrap disabled:opacity-40"
          >
            Submit Guess
            <span className="material-symbols-outlined text-base">send</span>
          </button>
        </div>

        {result === 'correct' && (
          <p className="text-center text-sm text-pitch-green font-headline font-bold mt-4">
            🎉 Correct! You won {coinsWon} coins (guessed at hint {revealedCount}).
          </p>
        )}
        {result === 'incorrect' && !gameOver && (
          <p className="text-center text-sm text-live font-headline font-bold mt-4">
            ❌ Not quite — reveal another hint or try again.
          </p>
        )}
        {result === 'incorrect' && gameOver && (
          <p className="text-center text-sm text-live font-headline font-bold mt-4">
            💔 Out of hints! The answer was {puzzle.answer}.
          </p>
        )}

        {gameOver && (
          <button
            onClick={playNextRound}
            className="w-full mt-4 bg-primary text-white font-headline font-bold text-sm py-3 rounded-lg hover:opacity-90 transition-all"
          >
            Play Next Player →
          </button>
        )}
      </div>
    </main>
  );
}