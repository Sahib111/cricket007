'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Player {
  id: string;
  name: string;
  role: 'BAT' | 'BOWL' | 'AR' | 'WK';
  country: string;
  rating: number; // overall rating out of 100
  basePrice: number; // in coins
}

// ── Balanced modern-day pool: ~20 BAT, ~20 BOWL, ~14 AR, ~8 WK ──
const DUMMY_PLAYERS: Player[] = [
  // ───────── BATSMEN (20) ─────────
  { id: 'b1',  name: 'Virat Kohli',          role: 'BAT', country: '🇮🇳 India',         rating: 93, basePrice: 3 },
  { id: 'b2',  name: 'Joe Root',             role: 'BAT', country: '🏴 England',        rating: 91, basePrice: 3 },
  { id: 'b3',  name: 'Travis Head',          role: 'BAT', country: '🇦🇺 Australia',     rating: 90, basePrice: 3 },
  { id: 'b4',  name: 'Yashasvi Jaiswal',     role: 'BAT', country: '🇮🇳 India',         rating: 89, basePrice: 3 },
  { id: 'b5',  name: 'Suryakumar Yadav',     role: 'BAT', country: '🇮🇳 India',         rating: 89, basePrice: 3 },
  { id: 'b6',  name: 'Harry Brook',          role: 'BAT', country: '🏴 England',        rating: 88, basePrice: 2 },
  { id: 'b7',  name: 'Shubman Gill',         role: 'BAT', country: '🇮🇳 India',         rating: 87, basePrice: 2 },
  { id: 'b8',  name: 'Babar Azam',           role: 'BAT', country: '🇵🇰 Pakistan',      rating: 87, basePrice: 2 },
  { id: 'b9',  name: 'Steve Smith',          role: 'BAT', country: '🇦🇺 Australia',     rating: 86, basePrice: 2 },
  { id: 'b10', name: 'Rohit Sharma',         role: 'BAT', country: '🇮🇳 India',         rating: 85, basePrice: 2 },
  { id: 'b11', name: 'Kane Williamson',      role: 'BAT', country: '🇳🇿 New Zealand',   rating: 84, basePrice: 2 },
  { id: 'b12', name: 'Marnus Labuschagne',   role: 'BAT', country: '🇦🇺 Australia',     rating: 84, basePrice: 2 },
  { id: 'b13', name: 'Devon Conway',         role: 'BAT', country: '🇳🇿 New Zealand',   rating: 83, basePrice: 2 },
  { id: 'b14', name: 'Ruturaj Gaikwad',      role: 'BAT', country: '🇮🇳 India',         rating: 82, basePrice: 1 },
  { id: 'b15', name: 'Shai Hope',            role: 'BAT', country: '🌴 West Indies',    rating: 82, basePrice: 1 },
  { id: 'b16', name: 'Pathum Nissanka',      role: 'BAT', country: '🇱🇰 Sri Lanka',     rating: 81, basePrice: 1 },
  { id: 'b17', name: 'Aiden Markram',        role: 'BAT', country: '🇿🇦 South Africa',  rating: 80, basePrice: 1 },
  { id: 'b18', name: 'Fakhar Zaman',         role: 'BAT', country: '🇵🇰 Pakistan',      rating: 79, basePrice: 1 },
  { id: 'b19', name: 'Ibrahim Zadran',       role: 'BAT', country: '🇦🇫 Afghanistan',   rating: 78, basePrice: 1 },
  { id: 'b20', name: 'Charith Asalanka',     role: 'BAT', country: '🇱🇰 Sri Lanka',     rating: 78, basePrice: 1 },

  // ───────── BOWLERS (20) ─────────
  { id: 'w1',  name: 'Jasprit Bumrah',       role: 'BOWL', country: '🇮🇳 India',        rating: 95, basePrice: 3 },
  { id: 'w2',  name: 'Kagiso Rabada',        role: 'BOWL', country: '🇿🇦 South Africa', rating: 90, basePrice: 3 },
  { id: 'w3',  name: 'Pat Cummins',          role: 'BOWL', country: '🇦🇺 Australia',    rating: 90, basePrice: 3 },
  { id: 'w4',  name: 'Mitchell Starc',       role: 'BOWL', country: '🇦🇺 Australia',    rating: 89, basePrice: 3 },
  { id: 'w5',  name: 'Shaheen Afridi',       role: 'BOWL', country: '🇵🇰 Pakistan',     rating: 88, basePrice: 2 },
  { id: 'w6',  name: 'Josh Hazlewood',       role: 'BOWL', country: '🇦🇺 Australia',    rating: 87, basePrice: 2 },
  { id: 'w7',  name: 'Rashid Khan',          role: 'BOWL', country: '🇦🇫 Afghanistan',  rating: 90, basePrice: 3 },
  { id: 'w8',  name: 'Mohammed Shami',       role: 'BOWL', country: '🇮🇳 India',        rating: 86, basePrice: 2 },
  { id: 'w9',  name: 'Trent Boult',          role: 'BOWL', country: '🇳🇿 New Zealand',  rating: 85, basePrice: 2 },
  { id: 'w10', name: 'Jofra Archer',         role: 'BOWL', country: '🏴 England',       rating: 85, basePrice: 2 },
  { id: 'w11', name: 'Mark Wood',            role: 'BOWL', country: '🏴 England',       rating: 84, basePrice: 2 },
  { id: 'w12', name: 'Anrich Nortje',        role: 'BOWL', country: '🇿🇦 South Africa', rating: 84, basePrice: 2 },
  { id: 'w13', name: 'Mohammed Siraj',       role: 'BOWL', country: '🇮🇳 India',        rating: 83, basePrice: 1 },
  { id: 'w14', name: 'Lockie Ferguson',      role: 'BOWL', country: '🇳🇿 New Zealand',  rating: 83, basePrice: 1 },
  { id: 'w15', name: 'Matt Henry',           role: 'BOWL', country: '🇳🇿 New Zealand',  rating: 82, basePrice: 1 },
  { id: 'w16', name: 'Naseem Shah',          role: 'BOWL', country: '🇵🇰 Pakistan',     rating: 81, basePrice: 1 },
  { id: 'w17', name: 'Adam Zampa',           role: 'BOWL', country: '🇦🇺 Australia',    rating: 82, basePrice: 1 },
  { id: 'w18', name: 'Yuzvendra Chahal',     role: 'BOWL', country: '🇮🇳 India',        rating: 80, basePrice: 1 },
  { id: 'w19', name: 'Gus Atkinson',         role: 'BOWL', country: '🏴 England',       rating: 81, basePrice: 1 },
  { id: 'w20', name: 'Haris Rauf',           role: 'BOWL', country: '🇵🇰 Pakistan',     rating: 80, basePrice: 1 },

  // ───────── ALL-ROUNDERS (14) ─────────
  { id: 'a1',  name: 'Ben Stokes',           role: 'AR', country: '🏴 England',         rating: 91, basePrice: 3 },
  { id: 'a2',  name: 'Ravindra Jadeja',      role: 'AR', country: '🇮🇳 India',          rating: 89, basePrice: 3 },
  { id: 'a3',  name: 'Hardik Pandya',        role: 'AR', country: '🇮🇳 India',          rating: 87, basePrice: 2 },
  { id: 'a4',  name: 'Glenn Maxwell',        role: 'AR', country: '🇦🇺 Australia',      rating: 86, basePrice: 2 },
  { id: 'a5',  name: 'Marco Jansen',         role: 'AR', country: '🇿🇦 South Africa',   rating: 85, basePrice: 2 },
  { id: 'a6',  name: 'Wanindu Hasaranga',    role: 'AR', country: '🇱🇰 Sri Lanka',      rating: 84, basePrice: 2 },
  { id: 'a7',  name: 'Sam Curran',           role: 'AR', country: '🏴 England',         rating: 83, basePrice: 2 },
  { id: 'a8',  name: 'Rachin Ravindra',      role: 'AR', country: '🇳🇿 New Zealand',    rating: 83, basePrice: 2 },
  { id: 'a9',  name: 'Axar Patel',           role: 'AR', country: '🇮🇳 India',          rating: 82, basePrice: 1 },
  { id: 'a10', name: 'Mitchell Marsh',       role: 'AR', country: '🇦🇺 Australia',      rating: 82, basePrice: 1 },
  { id: 'a11', name: 'Liam Livingstone',     role: 'AR', country: '🏴 England',         rating: 81, basePrice: 1 },
  { id: 'a12', name: 'Daryl Mitchell',       role: 'AR', country: '🇳🇿 New Zealand',    rating: 81, basePrice: 1 },
  { id: 'a13', name: 'Washington Sundar',    role: 'AR', country: '🇮🇳 India',          rating: 79, basePrice: 1 },
  { id: 'a14', name: 'Sikandar Raza',        role: 'AR', country: '🇿🇼 Zimbabwe',       rating: 78, basePrice: 1 },

  // ───────── WICKET-KEEPERS (8) ─────────
  { id: 'k1',  name: 'Rishabh Pant',         role: 'WK', country: '🇮🇳 India',          rating: 88, basePrice: 2 },
  { id: 'k2',  name: 'Jos Buttler',          role: 'WK', country: '🏴 England',         rating: 86, basePrice: 2 },
  { id: 'k3',  name: 'Heinrich Klaasen',     role: 'WK', country: '🇿🇦 South Africa',   rating: 87, basePrice: 2 },
  { id: 'k4',  name: 'Quinton de Kock',      role: 'WK', country: '🇿🇦 South Africa',   rating: 84, basePrice: 2 },
  { id: 'k5',  name: 'KL Rahul',             role: 'WK', country: '🇮🇳 India',          rating: 83, basePrice: 1 },
  { id: 'k6',  name: 'Nicholas Pooran',      role: 'WK', country: '🌴 West Indies',     rating: 82, basePrice: 1 },
  { id: 'k7',  name: 'Mohammad Rizwan',      role: 'WK', country: '🇵🇰 Pakistan',       rating: 83, basePrice: 1 },
  { id: 'k8',  name: 'Sanju Samson',         role: 'WK', country: '🇮🇳 India',          rating: 81, basePrice: 1 },
];

const INITIAL_BUDGET = 20; // 20 coins budget
const SQUAD_LIMIT = 5;

const ROLE_BADGES: Record<string, { label: string; color: string }> = {
  BAT: { label: 'BAT', color: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  BOWL: { label: 'BOWL', color: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
  AR: { label: 'ALL-ROUNDER', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  WK: { label: 'WICKET-KEEPER', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
};

export default function AuctionGame() {
  const [mode, setMode] = useState<'COMPUTER' | 'FRIEND'>('COMPUTER');
  const [squad, setSquad] = useState<Player[]>([]);
  const [spentCoins, setSpentCoins] = useState<number>(0);

  const remainingBudget = INITIAL_BUDGET - spentCoins;
  const isSquadFull = squad.length >= SQUAD_LIMIT;

  function handleBidPlayer(player: Player) {
    if (squad.some((p) => p.id === player.id)) return;
    if (isSquadFull) return;
    if (remainingBudget < player.basePrice) return;

    setSquad((prev) => [...prev, player]);
    setSpentCoins((prev) => prev + player.basePrice);
  }

  function handleRemovePlayer(playerId: string) {
    const playerToRemove = squad.find((p) => p.id === playerId);
    if (!playerToRemove) return;

    setSquad((prev) => prev.filter((p) => p.id !== playerId));
    setSpentCoins((prev) => prev - playerToRemove.basePrice);
  }

  function handleResetAuction() {
    setSquad([]);
    setSpentCoins(0);
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">

      {/* ── Mode Switcher & Budget Bar ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-xl space-y-4">

        {/* Mode Buttons */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Auction Mode
          </span>

          <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800" role="radiogroup" aria-label="Auction Mode">
            <button
              id="btn-mode-computer"
              type="button"
              onClick={() => setMode('COMPUTER')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${mode === 'COMPUTER'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
                }`}
              role="radio"
              aria-checked={mode === 'COMPUTER'}
            >
              🤖 vs Computer
            </button>

            <button
              id="btn-mode-friend"
              type="button"
              onClick={() => setMode('FRIEND')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${mode === 'FRIEND'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
                }`}
              role="radio"
              aria-checked={mode === 'FRIEND'}
            >
              👥 vs Friend
            </button>
          </div>
        </div>

        {/* Budget Counter & Progress */}
        <div className="grid grid-cols-3 gap-3 text-center border-t border-zinc-800/80 pt-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-2.5">
            <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Total Budget</span>
            <span className="text-base font-black text-yellow-400">{INITIAL_BUDGET} Coins</span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-2.5">
            <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Coins Spent</span>
            <span className="text-base font-bold text-zinc-300">{spentCoins} Coins</span>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5">
            <span className="text-[10px] uppercase font-semibold text-emerald-400 block">Remaining</span>
            <span className="text-base font-black text-emerald-300">{remainingBudget} Coins</span>
          </div>
        </div>
      </div>

      {/* ── Player Pool Section ── */}
      <section aria-labelledby="pool-heading" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 id="pool-heading" className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            Auction Player Pool ({DUMMY_PLAYERS.length} Players)
          </h2>
          <span className="text-xs text-zinc-500">
            Click &quot;Bid&quot; to draft into your 5-man squad
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list">
          {DUMMY_PLAYERS.map((player) => {
            const isDrafted = squad.some((p) => p.id === player.id);
            const canAfford = remainingBudget >= player.basePrice;
            const disabled = isDrafted || isSquadFull || !canAfford;

            return (
              <div
                key={player.id}
                className={[
                  'rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between gap-3 shadow-md',
                  isDrafted
                    ? 'border-violet-600/50 bg-violet-950/20 opacity-75'
                    : 'border-zinc-800 bg-zinc-900/90 hover:border-zinc-700',
                ].join(' ')}
              >
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {player.name}
                    </h3>
                    <p className="text-xs text-zinc-400">{player.country}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${ROLE_BADGES[player.role].color}`}
                    >
                      {ROLE_BADGES[player.role].label}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-black tabular-nums ${
                        player.rating >= 90
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : player.rating >= 85
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            : player.rating >= 80
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-zinc-700/30 text-zinc-400 border border-zinc-700/40'
                      }`}
                    >
                      ⭐ {player.rating}
                    </span>
                  </div>
                </div>

                {/* Pricing & Bid Action */}
                <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
                      Base Price
                    </span>
                    <span className="text-sm font-extrabold text-yellow-400">
                      🪙 {player.basePrice} Coins
                    </span>
                  </div>

                  {isDrafted ? (
                    <span className="rounded-xl bg-violet-500/20 px-3 py-1.5 text-xs font-bold text-violet-300 border border-violet-500/30">
                      ✓ Drafted
                    </span>
                  ) : (
                    <button
                      id={`btn-bid-${player.id}`}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleBidPlayer(player)}
                      className={[
                        'rounded-xl px-4 py-2 text-xs font-bold transition-all duration-150',
                        !canAfford
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          : isSquadFull
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-yellow-400 text-zinc-950 hover:bg-yellow-300 active:scale-95 shadow-md shadow-yellow-400/10',
                      ].join(' ')}
                    >
                      {!canAfford ? 'Low Coins' : isSquadFull ? 'Squad Full' : 'Bid & Buy'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Selected Team / Squad Section ── */}
      <section aria-labelledby="squad-heading" className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 id="squad-heading" className="text-sm font-bold uppercase tracking-wider text-white">
              Selected Squad
            </h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${isSquadFull
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-400'
                }`}
            >
              {squad.length} / {SQUAD_LIMIT} Players
            </span>
          </div>

          {squad.length > 0 && (
            <button
              id="btn-reset-auction"
              onClick={handleResetAuction}
              className="text-xs font-semibold text-zinc-400 hover:text-rose-400 transition-colors"
            >
              Reset Squad
            </button>
          )}
        </div>

        {/* Squad slots grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {Array.from({ length: SQUAD_LIMIT }).map((_, idx) => {
            const draftedPlayer = squad[idx];

            return (
              <div
                key={idx}
                className={[
                  'rounded-xl border p-3 flex flex-col justify-between min-h-[90px] transition-all',
                  draftedPlayer
                    ? 'border-violet-600/50 bg-gradient-to-b from-violet-950/40 to-zinc-900'
                    : 'border-dashed border-zinc-800 bg-zinc-950/40 items-center justify-center text-center',
                ].join(' ')}
              >
                {draftedPlayer ? (
                  <>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-violet-400">
                        #{idx + 1}
                      </span>
                      <button
                        onClick={() => handleRemovePlayer(draftedPlayer.id)}
                        className="text-zinc-500 hover:text-rose-400 text-xs font-bold leading-none"
                        title="Remove player"
                        aria-label={`Remove ${draftedPlayer.name}`}
                      >
                        ✕
                      </button>
                    </div>

                    <div className="my-1">
                      <p className="text-xs font-bold text-white truncate">
                        {draftedPlayer.name}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {draftedPlayer.role} · ⭐{draftedPlayer.rating} · 🪙{draftedPlayer.basePrice}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 py-2">
                    <span className="text-xs font-bold text-zinc-600">
                      Slot #{idx + 1}
                    </span>
                    <span className="text-[10px] text-zinc-600">Empty</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
