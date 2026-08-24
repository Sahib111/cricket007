'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/lib/useProfile';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics';

interface Player {
  name: string;
  role: string;
  rating: number; // out of 5
  basePrice: number;
}

const PLAYER_POOL: Player[] = [
  { name: 'V. Kohli', role: 'Batsman', rating: 5, basePrice: 1 },
  { name: 'R. Sharma', role: 'Batsman', rating: 5, basePrice: 1 },
  { name: 'J. Bumrah', role: 'Bowler', rating: 5, basePrice: 1 },
  { name: 'H. Pandya', role: 'All-Rounder', rating: 4, basePrice: 1 },
  { name: 'S. Smith', role: 'Batsman', rating: 5, basePrice: 1 },
  { name: 'P. Cummins', role: 'Bowler', rating: 5, basePrice: 1 },
  { name: 'D. Warner', role: 'Batsman', rating: 4, basePrice: 1 },
  { name: 'G. Maxwell', role: 'All-Rounder', rating: 4, basePrice: 1 },
  { name: 'B. Stokes', role: 'All-Rounder', rating: 5, basePrice: 1 },
  { name: 'J. Root', role: 'Batsman', rating: 4, basePrice: 1 },
  { name: 'J. Bairstow', role: 'Wicketkeeper', rating: 4, basePrice: 1 },
  { name: 'M. Starc', role: 'Bowler', rating: 4, basePrice: 1 },
  { name: 'K. Rabada', role: 'Bowler', rating: 4, basePrice: 1 },
  { name: 'B. de Kock', role: 'Wicketkeeper', rating: 4, basePrice: 1 },
  { name: 'S. Yadav', role: 'Batsman', rating: 4, basePrice: 1 },
  { name: 'R. Jadeja', role: 'All-Rounder', rating: 4, basePrice: 1 },
  { name: 'K. Rahul', role: 'Wicketkeeper', rating: 4, basePrice: 1 },
  { name: 'T. Boult', role: 'Bowler', rating: 3, basePrice: 1 },
  { name: 'S. Gill', role: 'Batsman', rating: 3, basePrice: 1 },
  { name: 'T. Head', role: 'Batsman', rating: 3, basePrice: 1 },
];

const BUDGET = 20;
const TEAM_SIZE = 5;
const LOT_COUNT = 10;
const MAX_ROUNDS_SAFEGUARD = 40;

interface RosterEntry {
  player: Player;
  price: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickLotPlayers(): number[] {
  const indices = shuffle(PLAYER_POOL.map((_, i) => i));
  return indices.slice(0, LOT_COUNT);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 justify-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-sm ${i < rating ? 'text-secondary' : 'text-outline-variant'
            }`}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default function AuctionPage() {
  const { userId } = useProfile();

  const [queue, setQueue] = useState<number[]>(() => pickLotPlayers());
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [currentBid, setCurrentBid] = useState(0);
  const [leadingBidder, setLeadingBidder] = useState<'you' | 'computer' | null>(null);
  const [openingBidder, setOpeningBidder] = useState<'you' | 'computer'>('you');
  const [yourWallet, setYourWallet] = useState(BUDGET);
  const [computerWallet, setComputerWallet] = useState(BUDGET);
  const [yourTeam, setYourTeam] = useState<RosterEntry[]>([]);
  const [computerTeam, setComputerTeam] = useState<RosterEntry[]>([]);
  const [status, setStatus] = useState('Waiting for your action...');
  const [roundOver, setRoundOver] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  const [rewardEarned, setRewardEarned] = useState<number | null>(null);
  const [gameOutcome, setGameOutcome] = useState<'won' | 'lost' | 'draw' | null>(null);
  const lotInitialized = useRef(false);

  const currentIndex = queue[0];
  const currentPlayer = currentIndex !== undefined ? PLAYER_POOL[currentIndex] : null;
  const yourFull = yourTeam.length >= TEAM_SIZE;
  const computerFull = computerTeam.length >= TEAM_SIZE;

  // Set up each new lot — OR auto-award to computer if your team is already full
  // but computer still needs players (fixes the stall where computer never bids).
  useEffect(() => {
    if (!currentPlayer) return;
    if (roundOver === false && lotInitialized.current) return;
    lotInitialized.current = true;

    setLeadingBidder(null);
    setRoundOver(false);
    setCurrentBid(currentPlayer.basePrice);

    if (yourFull && !computerFull) {
      if (currentPlayer.basePrice <= computerWallet) {
        setLeadingBidder('computer');
        setStatus(`Your team is full — Computer is picking up ${currentPlayer.name}...`);
        setTimeout(() => {
          finalizeRound('computer');
        }, 1000);
      } else {
        setStatus(`Computer can't afford ${currentPlayer.name} — unsold.`);
        setTimeout(() => {
          finalizeRound(null);
        }, 800);
      }
      return;
    }

    const opener: 'you' | 'computer' = Math.random() < 0.5 ? 'you' : 'computer';
    setOpeningBidder(opener);

    if (opener === 'computer' && !computerFull) {
      const ratingBoost = currentPlayer.rating >= 5 ? 3 : currentPlayer.rating >= 4 ? 2 : 1;
      const openBid = currentPlayer.basePrice + ratingBoost;
      if (openBid <= computerWallet) {
        setCurrentBid(openBid);
        setLeadingBidder('computer');
        setStatus('Computer opened the bidding! Bid higher or pass.');
      }
    }
    else {
      setStatus('Waiting for your action...');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  async function saveResult(outcome: 'won' | 'lost' | 'draw', reward: number) {
    if (!userId || resultSaved) return;
    setResultSaved(true);

    await supabase.from('game_results').insert({
      user_id: userId,
      game: 'auction',
      outcome,
      detail: {
        your_team: yourTeam.map((e) => ({ name: e.player.name, price: e.price, rating: e.player.rating })),
        computer_team: computerTeam.map((e) => ({ name: e.player.name, price: e.price, rating: e.player.rating })),
      },
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

  useEffect(() => {
    if (gameOver) {
      const yourRatingSum = yourTeam.reduce((s, e) => s + e.player.rating, 0);
      const compRatingSum = computerTeam.reduce((s, e) => s + e.player.rating, 0);

      let outcome: 'won' | 'lost' | 'draw';
      let reward: number;

      if (yourRatingSum > compRatingSum) {
        outcome = 'won';
        reward = 20;
      } else if (yourRatingSum < compRatingSum) {
        outcome = 'lost';
        reward = 0;
      } else {
        outcome = 'draw';
        reward = 10;
      }

      setGameOutcome(outcome);
      setRewardEarned(reward);
      saveResult(outcome, reward);

      track(ANALYTICS_EVENTS.AUCTION_GAME_COMPLETE, {
        outcome,
        coins_earned: reward,
        your_team_size: yourTeam.length,
        computer_team_size: computerTeam.length,
        your_rating: yourRatingSum,
        computer_rating: compRatingSum,
        budget_spent: BUDGET - yourWallet,
      });
      if (reward > 0) {
        track(ANALYTICS_EVENTS.COINS_EARNED, { amount: reward, source: 'auction' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  function nextLot(wasUnsold: boolean) {
    setRoundsPlayed((r) => r + 1);

    setQueue((prevQueue) => {
      const [first, ...rest] = prevQueue;
      let newQueue = rest;

      if (wasUnsold && !(yourFull && computerFull) && roundsPlayed < MAX_ROUNDS_SAFEGUARD) {
        newQueue = [...rest, first];
      }

      if (newQueue.length === 0 || (yourFull && computerFull) || roundsPlayed >= MAX_ROUNDS_SAFEGUARD) {
        setGameOver(true);
      } else {
        lotInitialized.current = false;
      }

      return newQueue;
    });
  }

  function finalizeRound(winner: 'you' | 'computer' | null) {
    setRoundOver(true);
    if (!currentPlayer) return;

    if (winner === 'you') {
      setYourWallet((w) => w - currentBid);
      setYourTeam((t) => [...t, { player: currentPlayer, price: currentBid }]);
      setStatus(`You won ${currentPlayer.name} for 🪙${currentBid}!`);
      track(ANALYTICS_EVENTS.AUCTION_PLAYER_WON, {
        player_name: currentPlayer.name,
        player_role: currentPlayer.role,
        player_rating: currentPlayer.rating,
        price: currentBid,
      });
    } else if (winner === 'computer') {
      setComputerWallet((w) => w - currentBid);
      setComputerTeam((t) => [...t, { player: currentPlayer, price: currentBid }]);
      setStatus(`Computer won ${currentPlayer.name} for 🪙${currentBid}.`);
      track(ANALYTICS_EVENTS.AUCTION_PLAYER_LOST, {
        player_name: currentPlayer.name,
        player_role: currentPlayer.role,
        price: currentBid,
      });
    } else {
      setStatus(`${currentPlayer.name} went unsold — back in the queue.`);
    }
  }

  function handleBid() {
    if (yourFull || roundOver || !currentPlayer) return;
    const nextBid = currentBid + 1;
    if (nextBid > yourWallet) {
      setStatus("You don't have enough coins to bid higher.");
      return;
    }
    setCurrentBid(nextBid);
    setLeadingBidder('you');
    setStatus('You are leading. Waiting for computer...');
    track(ANALYTICS_EVENTS.AUCTION_BID_PLACED, {
      player_name: currentPlayer.name,
      bid_amount: nextBid,
      wallet_remaining: yourWallet - nextBid,
    });

    setTimeout(() => {
      if (computerFull) {
        finalizeRound('you');
        return;
      }
      const aggressiveness = currentPlayer.rating >= 5 ? 0.9 : currentPlayer.rating >= 4 ? 0.7 : 0.4;
      const jump = currentPlayer.rating >= 5 ? 2 : 1;
      const computerBid = nextBid + jump;
      const computerCanAfford = computerBid <= computerWallet;
      const computerWantsToBid = Math.random() < aggressiveness && computerCanAfford;

      if (computerWantsToBid) {
        setCurrentBid(computerBid);
        setLeadingBidder('computer');
        setStatus('Computer outbid you! Bid again or pass.');
      } else {
        finalizeRound('you');
      }
    }, 900);
  }

  function handlePass() {
    if (roundOver) return;
    track(ANALYTICS_EVENTS.AUCTION_PASS, {
      player_name: currentPlayer?.name,
      current_bid: currentBid,
      leading_bidder: leadingBidder,
    });
    if (leadingBidder === 'computer' || leadingBidder === null) {
      finalizeRound(leadingBidder === 'computer' ? 'computer' : null);
    } else {
      finalizeRound('you');
    }
  }

  const wasUnsoldRound = roundOver && leadingBidder === null;
  const autoAwardInProgress = yourFull && !computerFull && !roundOver;

  return (
    <main className="w-full max-w-[1000px] mx-auto px-4 md:px-6 pt-6 sm:pt-8 pb-12">
      <div className="relative rounded-xl overflow-hidden h-[140px] sm:h-[170px] mb-6 bg-gradient-to-br from-stadium-blue to-primary flex flex-col items-center justify-center text-center px-4">
        <span className="text-[10px] font-mono-code font-bold text-white/70 tracking-widest uppercase mb-1">
          Build Your Team · Cricket Mini Auction
        </span>
        <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-white tracking-wide uppercase">
          Mini Auction
        </h1>
        <p className="font-body-md text-xs sm:text-sm text-white/80 mt-1">
          Build your ultimate dream team
        </p>
      </div>

      {gameOver ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center shadow-sm">
          <h2 className="font-headline font-extrabold text-xl text-primary mb-2">
            Auction Complete!
          </h2>
          <p className="font-body-md text-sm text-on-surface-variant mb-2">
            You built a team of {yourTeam.length} players spending 🪙{BUDGET - yourWallet}.
          </p>
          {gameOutcome && (
            <p className={`font-headline font-bold text-base mb-1 ${gameOutcome === 'won' ? 'text-pitch-green' : gameOutcome === 'lost' ? 'text-live' : 'text-secondary'
              }`}>
              {gameOutcome === 'won' && '🏆 You won! Your team had the higher rating.'}
              {gameOutcome === 'lost' && '💔 Computer won this round.'}
              {gameOutcome === 'draw' && '🤝 Draw — equal team rating.'}
            </p>
          )}
          {rewardEarned !== null && (
            <p className="font-headline font-bold text-sm text-pitch-green mb-6">
              🪙 {rewardEarned} coins earned this round.
            </p>
          )}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left">
            <div>
              <p className="font-headline font-bold text-sm text-primary mb-2">
                Your Team (Rating: {yourTeam.reduce((s, e) => s + e.player.rating, 0)})
              </p>
              {yourTeam.map((e, i) => (
                <p key={`${e.player.name}-${i}`} className="text-xs text-on-surface-variant">
                  {e.player.name} — 🪙{e.price}
                </p>
              ))}
            </div>
            <div>
              <p className="font-headline font-bold text-sm text-on-surface-variant mb-2">
                Computer (Rating: {computerTeam.reduce((s, e) => s + e.player.rating, 0)})
              </p>
              {computerTeam.map((e, i) => (
                <p key={`${e.player.name}-${i}`} className="text-xs text-on-surface-variant">
                  {e.player.name} — 🪙{e.price}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : currentPlayer ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-container-lowest border-l-4 border-l-primary border border-outline-variant rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="font-headline font-bold text-sm text-primary">Current Player</span>
              <span className="text-[10px] font-mono-code text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">
                {queue.length} PLAYER{queue.length !== 1 ? 'S' : ''} LEFT IN QUEUE
              </span>
            </div>

            {autoAwardInProgress && (
              <div className="mb-3 bg-secondary/10 border border-secondary/30 rounded-lg py-2 text-center">
                <span className="text-xs font-mono-code font-bold text-secondary">
                  Your team is full — Computer is filling its remaining spots
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-20 h-20 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                    person
                  </span>
                </div>
                <span className="font-headline font-bold text-sm text-on-surface">
                  {currentPlayer.name}
                </span>
                <StarRating rating={currentPlayer.rating} />
                <span className="text-[10px] font-mono-code bg-primary text-white px-2 py-0.5 rounded">
                  {currentPlayer.role}
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center gap-3 text-center">
                <span className="text-[10px] font-mono-code text-on-surface-variant uppercase tracking-wide">
                  Current Bid {openingBidder === 'computer' && leadingBidder === 'computer' && !roundOver ? '(Computer opened)' : ''}
                </span>
                <span className="font-headline font-extrabold text-3xl text-primary">
                  🪙 {currentBid}
                </span>
                {leadingBidder && (
                  <span className="text-xs font-body-md text-on-surface-variant">
                    by {leadingBidder === 'you' ? 'You' : 'Computer'}
                  </span>
                )}

                <div className="flex gap-3 mt-1">
                  <button
                    onClick={handlePass}
                    disabled={roundOver || autoAwardInProgress}
                    className="px-5 py-2 rounded-lg border border-outline-variant font-headline font-bold text-sm text-on-surface hover:bg-surface-container transition-all disabled:opacity-40"
                  >
                    Pass
                  </button>
                  <button
                    onClick={handleBid}
                    disabled={roundOver || yourFull}
                    className="px-5 py-2 rounded-lg bg-primary text-white font-headline font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40"
                  >
                    Bid +1
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-surface-container rounded-lg py-2 text-center">
              <span className="text-xs font-body-md text-on-surface-variant">
                {status}
              </span>
            </div>

            {roundOver && (
              <button
                onClick={() => nextLot(wasUnsoldRound)}
                className="w-full mt-3 bg-secondary text-white font-headline font-bold text-sm py-2.5 rounded-lg hover:opacity-90 transition-all"
              >
                Next Player →
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
              <span className="text-[10px] font-mono-code text-on-surface-variant uppercase tracking-wide">
                Wallet Balance
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-headline font-extrabold text-xl text-primary">
                  🪙 {yourWallet}
                </span>
                <span className="material-symbols-outlined text-secondary">add_circle</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest border-t-4 border-t-secondary border border-outline-variant rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="flex items-center gap-1 text-live text-xs font-bold font-mono-code">
                  <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse" />
                  LIVE
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono-code">World Cup</span>
              </div>
              <div className="flex justify-between text-xs font-headline font-bold text-on-surface mb-1">
                <span>IND</span><span>185/4</span>
              </div>
              <div className="flex justify-between text-xs font-headline font-bold text-on-surface-variant">
                <span>AUS</span><span>Yet to bat</span>
              </div>
              <Link href="/predict" className="text-xs font-headline font-bold text-secondary mt-2 inline-block hover:underline">
                View Scorecard →
              </Link>
            </div>

            <Link
              href="/predict"
              className="w-full bg-gradient-to-br from-secondary to-secondary-container text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-headline font-bold text-sm hover:shadow-md transition-all"
            >
              Predict and win coins
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
        </div>
      ) : null}

      {!gameOver && currentPlayer && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="flex items-center gap-1 font-headline font-bold text-sm text-primary">
                <span className="material-symbols-outlined text-base">person</span>
                Your Team
              </span>
              <span className="text-[10px] font-mono-code text-on-surface-variant">
                Purse {yourWallet}/{BUDGET}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {Array.from({ length: TEAM_SIZE }).map((_, i) => {
                const entry = yourTeam[i];
                return entry ? (
                  <div key={i} className="flex items-center justify-between bg-primary/5 rounded-lg px-3 py-2">
                    <span className="flex items-center gap-2 text-xs font-body-md text-on-surface">
                      <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                        {entry.player.name[0]}
                      </span>
                      {entry.player.name}
                    </span>
                    <span className="text-xs font-mono-code text-primary font-bold">🪙{entry.price}</span>
                  </div>
                ) : (
                  <div key={i} className="flex items-center justify-center bg-surface-container rounded-lg py-2 text-outline text-lg">
                    +
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="flex items-center gap-1 font-headline font-bold text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-base">smart_toy</span>
                Computer
              </span>
              <span className="text-[10px] font-mono-code text-on-surface-variant">
                Purse {computerWallet}/{BUDGET}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {Array.from({ length: TEAM_SIZE }).map((_, i) => {
                const entry = computerTeam[i];
                return entry ? (
                  <div key={i} className="flex items-center justify-between bg-surface-container rounded-lg px-3 py-2">
                    <span className="flex items-center gap-2 text-xs font-body-md text-on-surface">
                      <span className="w-6 h-6 rounded-full bg-outline text-white text-[10px] flex items-center justify-center font-bold">
                        {entry.player.name[0]}
                      </span>
                      {entry.player.name}
                    </span>
                    <span className="text-xs font-mono-code text-on-surface-variant font-bold">🪙{entry.price}</span>
                  </div>
                ) : (
                  <div key={i} className="flex items-center justify-center bg-surface-container rounded-lg py-2 text-outline text-lg">
                    <span className="material-symbols-outlined text-base">lock</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
