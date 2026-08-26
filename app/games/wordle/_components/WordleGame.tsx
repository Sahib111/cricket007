'use client';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/lib/useProfile';
import { useState, useEffect, useCallback, useRef } from 'react';
import { WORDLE_WORDS } from '@/lib/wordleWords';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics';

const CRICKET_WORDS = new Set(WORDLE_WORDS.map((w) => w.word.toUpperCase()));

// Small local cache so repeated guesses (or repeated sessions) don't re-hit the API
const dictionaryCache = new Map<string, boolean>();

async function isRealEnglishWord(word: string): Promise<boolean> {
  const upper = word.toUpperCase();

  // Always accept your curated cricket names/terms, even if not in a standard dictionary
  if (CRICKET_WORDS.has(upper)) return true;

  if (dictionaryCache.has(upper)) return dictionaryCache.get(upper)!;

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    const valid = res.ok;
    dictionaryCache.set(upper, valid);
    return valid;
  } catch {
    // Network hiccup — don't hard-block the player over a failed API call
    return true;
  }
}

function getDailyWord() {
  const startDate = new Date('2026-01-01').getTime();
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const daysSinceStart = Math.floor((todayMidnight - startDate) / (1000 * 60 * 60 * 24));
  const index = ((daysSinceStart % WORDLE_WORDS.length) + WORDLE_WORDS.length) % WORDLE_WORDS.length;
  return WORDLE_WORDS[index];
}

function getRandomWord(excludeWord?: string) {
  const pool = WORDLE_WORDS.filter((w) => w.word !== excludeWord);
  const source = pool.length > 0 ? pool : WORDLE_WORDS;
  return source[Math.floor(Math.random() * source.length)];
}

function getTodayDateString() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function getYesterdayDateString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
}

const DAILY = getDailyWord();
const MAX_ATTEMPTS = 6;
const WORD_LENGTH = 5;
const WIN_REWARD = 50;
const REPLAY_COST = 120;

type LetterState = 'correct' | 'present' | 'absent' | 'empty';

interface EvaluatedLetter {
  char: string;
  state: LetterState;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

function evaluateGuess(guess: string, target: string): EvaluatedLetter[] {
  const result: EvaluatedLetter[] = Array.from({ length: WORD_LENGTH }, (_, i) => ({
    char: guess[i] || '',
    state: 'absent',
  }));

  const targetChars = target.split('');
  const targetUsed = Array(WORD_LENGTH).fill(false);
  const guessUsed = Array(WORD_LENGTH).fill(false);

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === targetChars[i]) {
      result[i].state = 'correct';
      targetUsed[i] = true;
      guessUsed[i] = true;
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessUsed[i]) continue;
    for (let j = 0; j < WORD_LENGTH; j++) {
      if (!targetUsed[j] && guess[i] === targetChars[j]) {
        result[i].state = 'present';
        targetUsed[j] = true;
        break;
      }
    }
  }

  return result;
}

export default function WordleGame() {
  const { userId } = useProfile();
  const [targetWord, setTargetWord] = useState(DAILY.word);
  const [hint, setHint] = useState(DAILY.hint);
  const [mode, setMode] = useState<'daily' | 'paid'>('daily');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState<'IN_PROGRESS' | 'WON' | 'LOST'>('IN_PROGRESS');
  const [shakeRowIndex, setShakeRowIndex] = useState<number | null>(null);
  const [invalidWordMsg, setInvalidWordMsg] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [checkingToday, setCheckingToday] = useState(true);
  const [dailyAlreadyPlayed, setDailyAlreadyPlayed] = useState(false);
  const [walletCoins, setWalletCoins] = useState(0);
  const resultSaved = useRef(false);

  const isGameOver = gameStatus !== 'IN_PROGRESS';

  // Check if today's free daily word was already played
  useEffect(() => {
    if (!userId) return;

    async function checkTodayPlay() {
      const todayStr = getTodayDateString();
      const startOfDay = new Date(`${todayStr}T00:00:00`).toISOString();

      const { data } = await supabase
        .from('game_results')
        .select('outcome, detail, created_at')
        .eq('user_id', userId)
        .eq('game', 'wordle')
        .gte('created_at', startOfDay)
        .order('created_at', { ascending: false });

      const freeDailyPlayed = (data ?? []).some((row) => row.detail?.mode !== 'paid');
      if (freeDailyPlayed) {
        setDailyAlreadyPlayed(true);
      }

      const { data: wallet } = await supabase
        .from('wallets')
        .select('coins')
        .eq('user_id', userId)
        .single();
      if (wallet) setWalletCoins(wallet.coins ?? 0);

      setCheckingToday(false);
    }

    checkTodayPlay();
  }, [userId]);

  // Track game start once userId and word are ready
  useEffect(() => {
    if (!checkingToday && !dailyAlreadyPlayed) {
      track(ANALYTICS_EVENTS.WORDLE_GAME_STARTED, { mode, word_length: WORD_LENGTH });
    }
  }, [checkingToday, dailyAlreadyPlayed]);

  async function updateStreak(won: boolean) {
    if (!userId || mode !== 'daily') return; // only the free daily game affects streak

    const { data: wallet } = await supabase
      .from('wallets')
      .select('streak, last_played_date')
      .eq('user_id', userId)
      .single();

    if (!wallet) return;

    const todayStr = getTodayDateString();
    const yesterdayStr = getYesterdayDateString();

    let newStreak: number;
    if (!won) {
      newStreak = 0;
    } else if (wallet.last_played_date === yesterdayStr) {
      newStreak = (wallet.streak ?? 0) + 1;
    } else if (wallet.last_played_date === todayStr) {
      newStreak = wallet.streak ?? 0;
    } else {
      newStreak = 1;
    }

    await supabase
      .from('wallets')
      .update({ streak: newStreak, last_played_date: todayStr })
      .eq('user_id', userId);
  }

  async function saveResult(status: 'WON' | 'LOST', attemptCount: number) {
    if (!userId || resultSaved.current) return;
    resultSaved.current = true;

    const coinsEarned = status === 'WON' ? WIN_REWARD : 0;

    await supabase.from('game_results').insert({
      user_id: userId,
      game: 'wordle',
      outcome: status === 'WON' ? 'won' : 'lost',
      detail: { attempt: attemptCount, mode },
      coins_earned: coinsEarned,
    });

    await updateStreak(status === 'WON');

    if (coinsEarned > 0) {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('coins')
        .eq('user_id', userId)
        .single();

      if (wallet) {
        const newTotal = wallet.coins + coinsEarned;
        await supabase
          .from('wallets')
          .update({ coins: newTotal })
          .eq('user_id', userId);
        setWalletCoins(newTotal);
      }
    }

    if (mode === 'daily') {
      setDailyAlreadyPlayed(true);
    }
  }

  // Letters and backspace stay synchronous — no API call needed
  const handleKeyInput = useCallback(
    (char: string) => {
      if (isGameOver || isValidating) return;

      if (char === 'BACKSPACE' || char === 'BACK') {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[A-Z]$/.test(char)) {
        if (currentGuess.length < WORD_LENGTH) {
          setCurrentGuess((prev) => prev + char);
        }
      }
    },
    [currentGuess, isGameOver, isValidating]
  );

  // Enter is async — needs to check the word against the dictionary/cricket list
  const handleSubmitGuess = useCallback(async () => {
    if (isGameOver || isValidating) return;

    if (currentGuess.length < WORD_LENGTH) {
      setShakeRowIndex(guesses.length);
      setTimeout(() => setShakeRowIndex(null), 500);
      return;
    }

    setIsValidating(true);
    const valid = await isRealEnglishWord(currentGuess);
    setIsValidating(false);

    if (!valid) {
      setShakeRowIndex(guesses.length);
      setInvalidWordMsg(true);
      setTimeout(() => {
        setShakeRowIndex(null);
        setInvalidWordMsg(false);
      }, 900);
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    track(ANALYTICS_EVENTS.WORDLE_GUESS_SUBMITTED, {
      guess: currentGuess,
      attempt_number: newGuesses.length,
      mode,
    });

    if (currentGuess === targetWord) {
      setGameStatus('WON');
      saveResult('WON', newGuesses.length);
      track(ANALYTICS_EVENTS.WORDLE_GAME_WON, {
        attempts: newGuesses.length,
        mode,
        target_word: targetWord,
      });
      track(ANALYTICS_EVENTS.COINS_EARNED, { amount: WIN_REWARD, source: 'wordle' });
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setGameStatus('LOST');
      saveResult('LOST', newGuesses.length);
      track(ANALYTICS_EVENTS.WORDLE_GAME_LOST, {
        attempts: newGuesses.length,
        mode,
        target_word: targetWord,
      });
    }
  }, [currentGuess, guesses, isGameOver, isValidating, targetWord, mode, userId]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        handleSubmitGuess();
      } else if (e.key === 'Backspace') {
        handleKeyInput('BACKSPACE');
      } else {
        const key = e.key.toUpperCase();
        if (/^[A-Z]$/.test(key)) {
          handleKeyInput(key);
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKeyInput, handleSubmitGuess]);

  function onKeyClick(key: string) {
    if (key === 'ENTER') {
      handleSubmitGuess();
    } else {
      handleKeyInput(key);
    }
  }

  const keyStates = useCallback((): Record<string, LetterState> => {
    const states: Record<string, LetterState> = {};

    guesses.forEach((guess) => {
      const evalResult = evaluateGuess(guess, targetWord);
      evalResult.forEach(({ char, state }) => {
        const current = states[char];
        if (state === 'correct') {
          states[char] = 'correct';
        } else if (state === 'present' && current !== 'correct') {
          states[char] = 'present';
        } else if (state === 'absent' && !current) {
          states[char] = 'absent';
        }
      });
    });

    return states;
  }, [guesses, targetWord])();

  async function handlePlayAgainPaid() {
    if (!userId || walletCoins < REPLAY_COST) return;

    track(ANALYTICS_EVENTS.COINS_SPENT, { amount: REPLAY_COST, source: 'wordle_replay' });

    const newTotal = walletCoins - REPLAY_COST;
    await supabase
      .from('wallets')
      .update({ coins: newTotal })
      .eq('user_id', userId);
    setWalletCoins(newTotal);

    const nextWord = getRandomWord(targetWord);
    setTargetWord(nextWord.word);
    setHint(nextWord.hint);
    setMode('paid');
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('IN_PROGRESS');
    resultSaved.current = false;

    track(ANALYTICS_EVENTS.WORDLE_GAME_STARTED, { mode: 'paid', word_length: WORD_LENGTH });
  }

  if (checkingToday) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto py-10">
        <p className="text-sm text-on-surface-variant font-body-md">Loading today's word...</p>
      </div>
    );
  }

  if (dailyAlreadyPlayed && mode === 'daily' && !isGameOver) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto py-10">
        <div className="w-full rounded-2xl border border-outline-variant bg-surface-container p-6 text-center">
          <p className="text-lg font-bold font-headline text-on-surface">
            You've played today's free word.
          </p>
          <p className="text-xs text-on-surface-variant mt-2 mb-4">
            Come back tomorrow for a new free word — or spend 🪙{REPLAY_COST} to play again now.
          </p>
          <button
            onClick={handlePlayAgainPaid}
            disabled={walletCoins < REPLAY_COST}
            className="bg-secondary text-white font-headline font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-all disabled:opacity-40"
          >
            {walletCoins < REPLAY_COST
              ? `Need 🪙${REPLAY_COST} to Replay`
              : `Play Again — 🪙${REPLAY_COST}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {mode === 'paid' && (
        <div className="w-full text-center rounded-lg border border-secondary/30 bg-secondary/5 py-1.5">
          <p className="text-[10px] font-mono-code font-bold text-secondary uppercase tracking-wide">
            Paid Replay — Streak Not Affected
          </p>
        </div>
      )}

      {/* Hint Banner */}
      <div className="w-full text-center rounded-xl border border-outline-variant bg-surface-container p-3">
        <p className="text-xs font-medium text-on-surface-variant">
          Hint: {hint}
        </p>
      </div>

      {/* Color Legend */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 -mt-2 flex-wrap">
        <span className="text-[10px] sm:text-xs text-on-surface-variant flex items-center gap-1">🟩 Correct</span>
        <span className="text-[10px] sm:text-xs text-on-surface-variant flex items-center gap-1">🟥 Wrong spot</span>
        <span className="text-[10px] sm:text-xs text-on-surface-variant flex items-center gap-1">⬜ Not in word</span>
      </div>

      {invalidWordMsg && (
        <p className="text-xs font-bold text-live -mt-3">Not a valid word — try again.</p>
      )}
      {isValidating && (
        <p className="text-xs text-on-surface-variant -mt-3">Checking word...</p>
      )}

      {/* Grid */}
      <div className="grid grid-rows-6 gap-1.5 sm:gap-2 w-full max-w-[min(20rem,85vw)] mx-auto aspect-[5/6]" role="grid" aria-label="Wordle Grid">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => {
          const isSubmittedRow = rowIndex < guesses.length;
          const isCurrentRow = rowIndex === guesses.length && !isGameOver;
          const submittedGuess = guesses[rowIndex];
          const isShaking = shakeRowIndex === rowIndex;

          let rowLetters: { char: string; state: LetterState }[] = [];

          if (isSubmittedRow) {
            rowLetters = evaluateGuess(submittedGuess, targetWord);
          } else if (isCurrentRow) {
            rowLetters = Array.from({ length: WORD_LENGTH }, (_, i) => ({
              char: currentGuess[i] || '',
              state: 'empty',
            }));
          } else {
            rowLetters = Array.from({ length: WORD_LENGTH }, () => ({
              char: '',
              state: 'empty',
            }));
          }

          return (
            <div
              key={rowIndex}
              className={`grid grid-cols-5 gap-1.5 sm:gap-2 ${isShaking ? 'animate-bounce' : ''}`}
              role="row"
            >
              {rowLetters.map((tile, colIndex) => {
                let colorClasses = 'border-outline-variant bg-surface-container-lowest text-on-surface';

                if (tile.state === 'correct') {
                  colorClasses = 'border-pitch-green bg-pitch-green text-white font-bold';
                } else if (tile.state === 'present') {
                  colorClasses = 'border-secondary-container bg-secondary-container text-white font-bold';
                } else if (tile.state === 'absent') {
                  colorClasses = 'border-outline-variant bg-surface-container text-on-surface-variant font-bold';
                } else if (tile.char) {
                  colorClasses = 'border-outline bg-surface-container-lowest text-on-surface font-bold scale-105';
                }

                return (
                  <div
                    key={colIndex}
                    className={`flex items-center justify-center text-xl sm:text-2xl uppercase rounded-xl border-2 transition-all duration-300 select-none aspect-square ${colorClasses}`}
                    role="gridcell"
                    aria-label={`Letter ${colIndex + 1}: ${tile.char || 'empty'}`}
                  >
                    {tile.char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Game Over Banner */}
      {isGameOver && (
        <div
          className={`w-full rounded-2xl border p-4 text-center transition-all ${gameStatus === 'WON'
            ? 'border-pitch-green/40 bg-pitch-green/10 text-pitch-green'
            : 'border-live/40 bg-live/10 text-live'
            }`}
          role="alert"
        >
          <p className="text-lg font-bold font-headline">
            {gameStatus === 'WON' ? `🎉 Genius! You won 🪙${WIN_REWARD}!` : '💔 Out of attempts!'}
          </p>
          <p className="text-xs text-on-surface-variant mt-1 mb-3">
            {mode === 'daily'
              ? "Come back tomorrow for a new free word — or replay now for a fee."
              : 'Want another round?'}
          </p>
          <button
            onClick={handlePlayAgainPaid}
            disabled={walletCoins < REPLAY_COST}
            className="bg-secondary text-white font-headline font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-all disabled:opacity-40"
          >
            {walletCoins < REPLAY_COST
              ? `Need 🪙${REPLAY_COST} to Replay`
              : `Play Again — 🪙${REPLAY_COST}`}
          </button>
        </div>
      )}

      {/* Keyboard */}
      <div className="w-full flex flex-col gap-1.5 mt-2 select-none px-1" aria-label="On-screen Keyboard">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-[3px] sm:gap-1.5 w-full">
            {row.map((key) => {
              const state = keyStates[key];
              // Unused keys = darker; absent (used but not in word) = lighter
              let keyBg = 'bg-neutral-700 hover:bg-neutral-600 text-neutral-100';

              if (state === 'correct') {
                keyBg = 'bg-pitch-green text-white font-bold';
              } else if (state === 'present') {
                keyBg = 'bg-secondary-container text-white font-bold';
              } else if (state === 'absent') {
                keyBg = 'bg-neutral-400 text-neutral-700';
              }

              let widthClass = 'flex-1 min-w-0';
              let textClass = 'text-xs sm:text-sm font-semibold';

              if (key === 'ENTER') {
                widthClass = 'flex-[2] min-w-0';
                textClass = 'text-[11px] sm:text-xs font-bold tracking-tight px-1';
              } else if (key === 'BACKSPACE') {
                widthClass = 'flex-[1.5] min-w-0';
                textClass = 'text-sm sm:text-base font-bold';
              }

              return (
                <button
                  key={key}
                  id={`key-${key.toLowerCase()}`}
                  onClick={() => onKeyClick(key)}
                  disabled={isGameOver || isValidating}
                  className={`flex items-center justify-center rounded-lg transition-colors py-3.5 sm:py-3.5 disabled:opacity-40 active:scale-95 ${widthClass} ${textClass} ${keyBg}`}
                  aria-label={key === 'BACKSPACE' ? 'Backspace' : key}
                >
                  {key === 'BACKSPACE' ? '⌫' : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}