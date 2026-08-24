'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Player {
  id: string;
  name: string;
  role: 'BAT' | 'BOWL' | 'AR' | 'WK';
  country: string;
  basePrice: number; // in coins
}

const DUMMY_PLAYERS: Player[] = [
  { id: 'p1',  name: 'Virat Kohli',       role: 'BAT',  country: '🇮🇳 India',        basePrice: 4 },
  { id: 'p2',  name: 'Jasprit Bumrah',    role: 'BOWL', country: '🇮🇳 India',        basePrice: 4 },
  { id: 'p3',  name: 'Rashid Khan',       role: 'BOWL', country: '🇦🇫 Afghanistan',  basePrice: 3 },
  { id: 'p4',  name: 'Andre Russell',     role: 'AR',   country: '🌴 West Indies',   basePrice: 3 },
  { id: 'p5',  name: 'Jos Buttler',       role: 'WK',   country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',     basePrice: 3 },
  { id: 'p6',  name: 'Suryakumar Yadav', role: 'BAT',  country: '🇮🇳 India',        basePrice: 3 },
  { id: 'p7',  name: 'Hardik Pandya',     role: 'AR',   country: '🇮🇳 India',        basePrice: 2 },
  { id: 'p8',  name: 'Heinrich Klaasen',  role: 'WK',   country: '🇿🇦 South Africa', basePrice: 2 },
  { id: 'p9',  name: 'Trent Boult',       role: 'BOWL', country: '🇳🇿 New Zealand',  basePrice: 2 },
  { id: 'p10', name: 'Shubman Gill',      role: 'BAT',  country: '🇮🇳 India',        basePrice: 2 },
];

const INITIAL_BUDGET = 20; // 20 coins budget
const SQUAD_LIMIT = 5;

const ROLE_BADGES: Record<string, { label: string; color: string }> = {
  BAT:  { label: 'BAT',  color: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  BOWL: { label: 'BOWL', color: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
  AR:   { label: 'ALL-ROUNDER', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  WK:   { label: 'WICKET-KEEPER', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
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
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                mode === 'COMPUTER'
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
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                mode === 'FRIEND'
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

                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${
                      ROLE_BADGES[player.role].color
                    }`}
                  >
                    {ROLE_BADGES[player.role].label}
                  </span>
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
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                isSquadFull
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
                        {draftedPlayer.role} · 🪙{draftedPlayer.basePrice}
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
