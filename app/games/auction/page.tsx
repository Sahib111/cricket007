'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfileContext } from '@/app/_components/ProfileProvider';
import {
  trackAuctionStart,
  trackAuctionBidPlaced,
  trackAuctionPass,
  trackAuctionPlayerWon,
  trackAuctionPlayerLost,
  trackAuctionComplete,
  trackCoinsEarned,
} from '@/lib/analytics';

interface Player {
  name: string;
  role: string;
  rating: number; // out of 5
  basePrice: number;
}

const PLAYER_POOL: Player[] = [
  { name: 'V. Kohli', role: 'Batsman', rating: 5, basePrice: 1 },
  { name: 'R. Sharma', role: 'Batsman', rating: 4, basePrice: 1 },
  { name: 'J. Bumrah', role: 'Bowler', rating: 5, basePrice: 1 },
  { name: 'H. Pandya', role: 'All-Rounder', rating: 4, basePrice: 1 },
  { name: 'S. Smith', role: 'Batsman', rating: 5, basePrice: 1 },
  { name: 'P. Cummins', role: 'Bowler', rating: 5, basePrice: 1 },
  { name: 'D. Warner', role: 'Batsman', rating: 4, basePrice: 1 },
  { name: 'G. Maxwell', role: 'All-Rounder', rating: 4, basePrice: 1 },
  { name: 'B. Stokes', role: 'All-Rounder', rating: 4, basePrice: 1 },
  { name: 'J. Root', role: 'Batsman', rating: 5, basePrice: 1 },
  { name: 'J. Bairstow', role: 'Wicketkeeper', rating: 3, basePrice: 1 },
  { name: 'M. Starc', role: 'Bowler', rating: 5, basePrice: 1 },
  { name: 'K. Rabada', role: 'Bowler', rating: 5, basePrice: 1 },
  { name: 'B. de Kock', role: 'Wicketkeeper', rating: 4, basePrice: 1 },
  { name: 'S. Yadav', role: 'Batsman', rating: 4, basePrice: 1 },
  { name: 'R. Jadeja', role: 'All-Rounder', rating: 5, basePrice: 1 },
  { name: 'K. Rahul', role: 'Wicketkeeper', rating: 3, basePrice: 1 },
  { name: 'T. Boult', role: 'Bowler', rating: 4, basePrice: 1 },
  { name: 'S. Gill', role: 'Batsman', rating: 4, basePrice: 1 },
  { name: 'T. Head', role: 'Batsman', rating: 4, basePrice: 1 },

  { name: 'K. Williamson', role: 'Batsman', rating: 5, basePrice: 1 },
  { name: 'B. Azam', role: 'Batsman', rating: 4, basePrice: 1 },
  { name: 'H. Brook', role: 'Batsman', rating: 4, basePrice: 1 },
  { name: 'D. Mitchell', role: 'All-Rounder', rating: 4, basePrice: 1 },
  { name: 'M. Labuschagne', role: 'Batsman', rating: 3, basePrice: 1 },
  { name: 'D. Conway', role: 'Batsman', rating: 4, basePrice: 1 },
  { name: 'Y. Jaiswal', role: 'Batsman', rating: 4, basePrice: 1 },
  { name: 'R. Pant', role: 'Wicketkeeper', rating: 4, basePrice: 1 },
  { name: 'J. Buttler', role: 'Wicketkeeper', rating: 4, basePrice: 1 },
  { name: 'M. Rizwan', role: 'Wicketkeeper', rating: 3, basePrice: 1 },
  { name: 'H. Klaasen', role: 'Wicketkeeper', rating: 4, basePrice: 1 },
  { name: 'N. Pooran', role: 'Wicketkeeper', rating: 4, basePrice: 1 },
  { name: 'F. du Plessis', role: 'Batsman', rating: 3, basePrice: 1 },
  { name: 'R. Gaikwad', role: 'Batsman', rating: 3, basePrice: 1 },
  { name: 'S. Samson', role: 'Wicketkeeper', rating: 3, basePrice: 1 },
  { name: 'I. Kishan', role: 'Wicketkeeper', rating: 3, basePrice: 1 },

  { name: 'J. Livingstone', role: 'All-Rounder', rating: 3, basePrice: 1 },
  { name: 'M. Marsh', role: 'All-Rounder', rating: 3, basePrice: 1 },
  { name: 'R. Ashwin', role: 'All-Rounder', rating: 4, basePrice: 1 },
  { name: 'A. Patel', role: 'All-Rounder', rating: 3, basePrice: 1 },
  { name: 'M. Santner', role: 'All-Rounder', rating: 3, basePrice: 1 },
  { name: 'W. Hasaranga', role: 'All-Rounder', rating: 3, basePrice: 1 },
  { name: 'M. Jansen', role: 'All-Rounder', rating: 3, basePrice: 1 },
  { name: 'R. Ravindra', role: 'All-Rounder', rating: 3, basePrice: 1 },
  { name: 'S. Curran', role: 'All-Rounder', rating: 3, basePrice: 1 },
  { name: 'M. Ali', role: 'All-Rounder', rating: 2, basePrice: 1 },
  { name: 'W. Sundar', role: 'All-Rounder', rating: 2, basePrice: 1 },
  { name: 'S. Raza', role: 'All-Rounder', rating: 3, basePrice: 1 },

  { name: 'J. Hazlewood', role: 'Bowler', rating: 5, basePrice: 1 },
  { name: 'J. Archer', role: 'Bowler', rating: 4, basePrice: 1 },
  { name: 'S. Afridi', role: 'Bowler', rating: 4, basePrice: 1 },
  { name: 'M. Shami', role: 'Bowler', rating: 4, basePrice: 1 },
  { name: 'M. Siraj', role: 'Bowler', rating: 3, basePrice: 1 },
  { name: 'M. Henry', role: 'Bowler', rating: 4, basePrice: 1 },
  { name: 'N. Lyon', role: 'Bowler', rating: 4, basePrice: 1 },
  { name: 'A. Zampa', role: 'Bowler', rating: 3, basePrice: 1 },
  { name: 'R. Khan', role: 'Bowler', rating: 5, basePrice: 1 },
  { name: 'A. Rashid', role: 'Bowler', rating: 4, basePrice: 1 },
  { name: 'K. Maharaj', role: 'Bowler', rating: 3, basePrice: 1 },
  { name: 'M. Theekshana', role: 'Bowler', rating: 3, basePrice: 1 },
  { name: 'T. Shamsi', role: 'Bowler', rating: 2, basePrice: 1 },
  { name: 'L. Ferguson', role: 'Bowler', rating: 3, basePrice: 1 },
  { name: 'T. Southee', role: 'Bowler', rating: 3, basePrice: 1 },
  { name: 'A. Nortje', role: 'Bowler', rating: 3, basePrice: 1 },
  { name: 'N. Ellis', role: 'Bowler', rating: 2, basePrice: 1 },
  { name: 'Y. Chahal', role: 'Bowler', rating: 3, basePrice: 1 },
  { name: 'R. Bishnoi', role: 'Bowler', rating: 2, basePrice: 1 },
  { name: 'N. Ahmad', role: 'Bowler', rating: 2, basePrice: 1 },
  { name: 'N. Shah', role: 'Bowler', rating: 3, basePrice: 1 },
  { name: 'M. Wood', role: 'Bowler', rating: 3, basePrice: 1 },
  { name: 'G. Atkinson', role: 'Bowler', rating: 3, basePrice: 1 },
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

/**
 * Calculates computer's strategic valuation and maximum willingness to pay (WTP) for a player.
 * Prevents early purse exhaustion while keeping bidding competitive and dynamic.
 */
function getComputerPlayerValuation(
  player: Player,
  computerWallet: number,
  computerTeam: RosterEntry[],
  teamSize: number = TEAM_SIZE
): { maxWTP: number; hardCap: number; openBid: number } {
  const spotsNeeded = teamSize - computerTeam.length;
  if (spotsNeeded <= 0 || computerWallet <= 0) {
    return { maxWTP: 0, hardCap: 0, openBid: 0 };
  }

  const spotsRemainingAfter = Math.max(0, spotsNeeded - 1);
  // Reserve at least 1 coin for each future squad spot
  const hardCap = Math.max(1, computerWallet - spotsRemainingAfter);

  // Baseline valuation based on player rating (Budget: 20 for 5 spots = 4.0 avg/player)
  let baseVal = 1;
  if (player.rating >= 5) {
    baseVal = 6;
  } else if (player.rating === 4) {
    baseVal = 4;
  } else if (player.rating === 3) {
    baseVal = 2;
  } else {
    baseVal = 1;
  }

  // Dynamic budget adjustments based on purse health
  const avgBudgetPerRemainingSpot = computerWallet / spotsNeeded;
  if (avgBudgetPerRemainingSpot >= 4.5) {
    if (player.rating >= 4) baseVal += 1;
  } else if (avgBudgetPerRemainingSpot < 3.0) {
    baseVal = Math.max(1, baseVal - 1);
  } else if (avgBudgetPerRemainingSpot <= 1.8) {
    baseVal = Math.min(2, baseVal);
  }

  // Role need balance
  const roleCount = computerTeam.filter(
    (e) => e.player.role.toLowerCase() === player.role.toLowerCase()
  ).length;
  if (roleCount === 0) {
    baseVal += 1;
  } else if (roleCount >= 2) {
    baseVal = Math.max(1, baseVal - 1);
  }

  // Stage-aware budget ceilings to prevent burning the entire purse on early lots
  if (spotsNeeded >= 4) {
    // First 1-2 slots: strict max ceiling to preserve flexibility for remaining 4 spots
    baseVal = Math.min(baseVal, player.rating >= 5 ? 6 : 4);
  } else if (spotsNeeded === 3) {
    baseVal = Math.min(baseVal, player.rating >= 5 ? 7 : 5);
  } else if (spotsNeeded === 2) {
    baseVal = Math.min(baseVal, player.rating >= 5 ? 8 : 6);
  } else if (spotsNeeded === 1) {
    // Final slot: computer can spend everything left if the player is high value
    if (player.rating >= 4) {
      baseVal = Math.max(baseVal, hardCap);
    }
  }

  const maxWTP = Math.min(hardCap, Math.max(player.basePrice, baseVal));

  // Determine strategic opening bid (never overpaying right away)
  let openBid = player.basePrice;
  if (player.rating >= 5 && avgBudgetPerRemainingSpot >= 3.5 && maxWTP >= 2) {
    openBid = 2;
  } else if (player.rating >= 4 && avgBudgetPerRemainingSpot >= 3.0 && maxWTP >= 2 && Math.random() < 0.4) {
    openBid = 2;
  } else {
    openBid = 1;
  }
  openBid = Math.min(openBid, maxWTP, hardCap);

  return { maxWTP, hardCap, openBid };
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

function getRoleIcon(role: string) {
  switch (role.toLowerCase()) {
    case 'batsman':
      return 'sports_cricket';
    case 'bowler':
      return 'sports_baseball';
    case 'all-rounder':
      return 'groups';
    case 'wicketkeeper':
      return 'pan_tool';
    default:
      return 'person';
  }
}

export default function AuctionPage() {
  const { userId, coins, updateWallet } = useProfileContext();

  useEffect(() => {
    trackAuctionStart(LOT_COUNT, BUDGET, TEAM_SIZE);
  }, []);

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

  const yourTeamRating = yourTeam.reduce((s, e) => s + e.player.rating, 0);
  const computerTeamRating = computerTeam.reduce((s, e) => s + e.player.rating, 0);

  function autoAssignRemainingToComputer(
    updatedYourTeam: RosterEntry[],
    queueIndices: number[],
    messagePrefix: string = ''
  ) {
    const spotsNeeded = TEAM_SIZE - computerTeam.length;
    if (spotsNeeded <= 0) {
      setRoundOver(true);
      setTimeout(() => setGameOver(true), 1200);
      return;
    }

    const toAssignIndices = queueIndices.slice(0, spotsNeeded);
    let compWallet = computerWallet;
    const newCompEntries: RosterEntry[] = [];

    for (const idx of toAssignIndices) {
      const p = PLAYER_POOL[idx];
      const price = Math.max(0, Math.min(compWallet, p.basePrice));
      compWallet -= price;
      newCompEntries.push({ player: p, price });
      trackAuctionPlayerLost(
        p.name,
        p.role,
        price
      );
    }

    const finalCompTeam = [...computerTeam, ...newCompEntries];
    setComputerWallet(compWallet);
    setComputerTeam(finalCompTeam);
    setRoundOver(true);
    setStatus(
      messagePrefix
        ? `${messagePrefix} Your team is complete — remaining players assigned to Computer.`
        : 'Your team is complete — remaining players assigned to Computer.'
    );

    setTimeout(() => {
      setGameOver(true);
    }, 1400);
  }

  function autoAssignRemainingToUser(
    updatedComputerTeam: RosterEntry[],
    queueIndices: number[],
    messagePrefix: string = ''
  ) {
    const spotsNeeded = TEAM_SIZE - yourTeam.length;
    if (spotsNeeded <= 0) {
      setRoundOver(true);
      setTimeout(() => setGameOver(true), 1200);
      return;
    }

    const toAssignIndices = queueIndices.slice(0, spotsNeeded);
    let userWallet = yourWallet;
    const newUserEntries: RosterEntry[] = [];

    for (const idx of toAssignIndices) {
      const p = PLAYER_POOL[idx];
      const price = Math.max(0, Math.min(userWallet, p.basePrice));
      userWallet -= price;
      newUserEntries.push({ player: p, price });
      trackAuctionPlayerWon(
        p.name,
        p.role,
        p.rating,
        price
      );
    }

    const finalYourTeam = [...yourTeam, ...newUserEntries];
    setYourWallet(userWallet);
    setYourTeam(finalYourTeam);
    setRoundOver(true);
    setStatus(
      messagePrefix
        ? `${messagePrefix} Computer team is complete — remaining players assigned to You.`
        : 'Computer team is complete — remaining players assigned to You.'
    );

    setTimeout(() => {
      setGameOver(true);
    }, 1400);
  }

  // Set up each new lot — OR auto-award remaining if either team is already full
  useEffect(() => {
    if (!currentPlayer || gameOver) return;
    if (roundOver === false && lotInitialized.current) return;
    lotInitialized.current = true;

    setLeadingBidder(null);
    setRoundOver(false);
    setCurrentBid(currentPlayer.basePrice);

    if (yourFull && !computerFull) {
      autoAssignRemainingToComputer(yourTeam, queue, 'Your team is full!');
      return;
    }

    if (computerFull && !yourFull) {
      autoAssignRemainingToUser(computerTeam, queue, 'Computer team is full!');
      return;
    }

    const opener: 'you' | 'computer' = Math.random() < 0.5 ? 'you' : 'computer';
    setOpeningBidder(opener);

    if (opener === 'computer' && !computerFull) {
      const { openBid, hardCap } = getComputerPlayerValuation(
        currentPlayer,
        computerWallet,
        computerTeam,
        TEAM_SIZE
      );
      if (openBid <= hardCap && openBid <= computerWallet && openBid > 0) {
        setCurrentBid(openBid);
        setLeadingBidder('computer');
        setStatus('Computer opened the bidding! Bid higher or pass.');
      } else {
        setStatus('Waiting for your action...');
      }
    } else {
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

      const currentBalance = (wallet && typeof wallet.coins === 'number') ? wallet.coins : coins;
      const newTotal = currentBalance + reward;
      updateWallet({ coins: newTotal });

      await supabase
        .from('wallets')
        .update({ coins: newTotal })
        .eq('user_id', userId);
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

      trackAuctionComplete({
        outcome,
        coinsEarned: reward,
        yourTeamSize: yourTeam.length,
        computerTeamSize: computerTeam.length,
        yourRating: yourRatingSum,
        computerRating: compRatingSum,
        budgetSpent: BUDGET - yourWallet,
      });
      if (reward > 0) {
        trackCoinsEarned(reward, 'auction');
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
      const nextYourTeam = [...yourTeam, { player: currentPlayer, price: currentBid }];
      setYourWallet((w) => w - currentBid);
      setYourTeam(nextYourTeam);
      trackAuctionPlayerWon(
        currentPlayer.name,
        currentPlayer.role,
        currentPlayer.rating,
        currentBid
      );

      if (nextYourTeam.length >= TEAM_SIZE) {
        if (computerTeam.length < TEAM_SIZE) {
          autoAssignRemainingToComputer(
            nextYourTeam,
            queue.slice(1),
            `You won ${currentPlayer.name} for 🪙${currentBid}!`
          );
        } else {
          setStatus(`You won ${currentPlayer.name} for 🪙${currentBid}! Both teams complete.`);
          setTimeout(() => setGameOver(true), 1200);
        }
        return;
      }

      setStatus(`You won ${currentPlayer.name} for 🪙${currentBid}!`);
    } else if (winner === 'computer') {
      const nextCompTeam = [...computerTeam, { player: currentPlayer, price: currentBid }];
      setComputerWallet((w) => w - currentBid);
      setComputerTeam(nextCompTeam);
      trackAuctionPlayerLost(
        currentPlayer.name,
        currentPlayer.role,
        currentBid
      );

      if (nextCompTeam.length >= TEAM_SIZE) {
        if (yourTeam.length < TEAM_SIZE) {
          autoAssignRemainingToUser(
            nextCompTeam,
            queue.slice(1),
            `Computer won ${currentPlayer.name} for 🪙${currentBid}!`
          );
        } else {
          setStatus(`Computer won ${currentPlayer.name} for 🪙${currentBid}! Both teams complete.`);
          setTimeout(() => setGameOver(true), 1200);
        }
        return;
      }

      setStatus(`Computer won ${currentPlayer.name} for 🪙${currentBid}.`);
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
    trackAuctionBidPlaced(
      currentPlayer.name,
      nextBid,
      yourWallet - nextBid
    );

    setTimeout(() => {
      if (computerFull) {
        finalizeRound('you');
        return;
      }
      const { maxWTP, hardCap } = getComputerPlayerValuation(
        currentPlayer,
        computerWallet,
        computerTeam,
        TEAM_SIZE
      );
      const computerBid = nextBid + 1;
      const canAfford = computerBid <= hardCap && computerBid <= computerWallet;
      const isWithinValuation = computerBid <= maxWTP;

      let computerWantsToBid = false;

      if (canAfford) {
        if (isWithinValuation) {
          const willingness = currentPlayer.rating >= 5 ? 0.95 : currentPlayer.rating === 4 ? 0.85 : 0.7;
          computerWantsToBid = Math.random() < willingness;
        } else if (
          computerBid === maxWTP + 1 &&
          currentPlayer.rating >= 4 &&
          yourWallet > 5 &&
          Math.random() < 0.2
        ) {
          // Tactical pressure: push the user to spend 1 coin more on star players if safe
          computerWantsToBid = true;
        }
      }

      if (computerWantsToBid) {
        setCurrentBid(computerBid);
        setLeadingBidder('computer');
        setStatus('Computer outbid you! Bid again or pass.');
      } else {
        finalizeRound('you');
      }
    }, 850);
  }

  function handlePass() {
    if (roundOver) return;
    trackAuctionPass(
      currentPlayer?.name,
      currentBid,
      leadingBidder
    );
    if (leadingBidder === 'computer' || leadingBidder === null) {
      finalizeRound(leadingBidder === 'computer' ? 'computer' : null);
    } else {
      finalizeRound('you');
    }
  }

  const wasUnsoldRound = roundOver && leadingBidder === null;
  const autoAwardInProgress =
    (yourFull && !computerFull && !roundOver) ||
    (computerFull && !yourFull && !roundOver);

  return (
    <main className="w-full max-w-[1000px] mx-auto px-4 md:px-6 pt-6 sm:pt-8 pb-12">
      <div className="relative rounded-xl overflow-hidden h-[140px] sm:h-[170px] mb-6 bg-gradient-to-br from-stadium-blue to-primary flex flex-col items-center justify-center text-center px-4 shadow-md">
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
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-8 text-center shadow-md max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-3xl">
              {gameOutcome === 'won' ? 'trophy' : gameOutcome === 'lost' ? 'sentiment_very_dissatisfied' : 'handshake'}
            </span>
          </div>
          <h2 className="font-headline font-extrabold text-2xl text-primary mb-1">
            Auction Complete!
          </h2>
          <p className="font-body-md text-sm text-on-surface-variant mb-4">
            You built a team of {yourTeam.length} players spending 🪙{BUDGET - yourWallet}.
          </p>
          {gameOutcome && (
            <div className={`inline-block px-4 py-2 rounded-xl font-headline font-bold text-base mb-3 ${
              gameOutcome === 'won' ? 'bg-pitch-green/10 text-pitch-green border border-pitch-green/30' : 
              gameOutcome === 'lost' ? 'bg-live/10 text-live border border-live/30' : 
              'bg-secondary/10 text-secondary border border-secondary/30'
            }`}>
              {gameOutcome === 'won' && '🏆 Victory! Your team had the higher rating.'}
              {gameOutcome === 'lost' && '💔 Defeat! Computer team had the higher rating.'}
              {gameOutcome === 'draw' && '🤝 Draw! Equal team rating.'}
            </div>
          )}
          {rewardEarned !== null && (
            <p className="font-headline font-bold text-sm text-pitch-green mb-6">
              🪙 {rewardEarned} coins earned this round
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left border-t border-outline-variant pt-5">
            <div className="bg-surface-container/50 rounded-xl p-4 border border-outline-variant">
              <div className="flex justify-between items-center mb-3">
                <span className="font-headline font-bold text-sm text-primary">Your Roster</span>
                <span className="text-xs font-bold text-pitch-green">⭐ {yourTeamRating} pts</span>
              </div>
              <div className="space-y-2">
                {yourTeam.map((e, i) => (
                  <div key={`${e.player.name}-${i}`} className="flex justify-between items-center text-xs">
                    <span className="text-on-surface font-medium">{e.player.name} <span className="text-[10px] text-on-surface-variant">({e.player.role})</span></span>
                    <span className="font-mono-code font-bold text-primary">🪙{e.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container/50 rounded-xl p-4 border border-outline-variant">
              <div className="flex justify-between items-center mb-3">
                <span className="font-headline font-bold text-sm text-on-surface-variant">Computer Roster</span>
                <span className="text-xs font-bold text-secondary">⭐ {computerTeamRating} pts</span>
              </div>
              <div className="space-y-2">
                {computerTeam.map((e, i) => (
                  <div key={`${e.player.name}-${i}`} className="flex justify-between items-center text-xs">
                    <span className="text-on-surface font-medium">{e.player.name} <span className="text-[10px] text-on-surface-variant">({e.player.role})</span></span>
                    <span className="font-mono-code font-bold text-on-surface-variant">🪙{e.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : currentPlayer ? (
        <div className="flex flex-col gap-6">
          {/* Wallet Balance Bar */}
          <div className="flex items-center justify-between bg-surface-container-lowest border border-outline-variant rounded-xl px-5 py-3 shadow-sm">
            <span className="text-[10px] font-mono-code text-on-surface-variant uppercase tracking-wider font-bold">
              Purse Remaining
            </span>
            <span className="font-headline font-extrabold text-xl text-primary">
              🪙 {yourWallet}
            </span>
          </div>

          {/* Current Player Auction Card */}
          <div className="bg-surface-container-lowest border-l-4 border-l-primary border border-outline-variant rounded-xl p-5 sm:p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="font-headline font-bold text-sm text-primary">Current Player</span>
              <span className="text-[10px] font-mono-code text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full font-semibold">
                {queue.length} PLAYER{queue.length !== 1 ? 'S' : ''} LEFT IN QUEUE
              </span>
            </div>

            {autoAwardInProgress && (
              <div className="mb-4 bg-secondary/10 border border-secondary/30 rounded-xl py-2 px-3 text-center">
                <span className="text-xs font-mono-code font-bold text-secondary">
                  {yourFull
                    ? 'Your team is full — Computer is filling its remaining spots'
                    : 'Computer team is full — Filling your remaining spots'}
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-6 items-center">
              {/* Player Info */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-20 h-20 rounded-xl bg-surface-container border border-outline-variant flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-4xl text-primary">
                    {getRoleIcon(currentPlayer.role)}
                  </span>
                </div>
                <span className="font-headline font-bold text-base text-on-surface">
                  {currentPlayer.name}
                </span>
                <StarRating rating={currentPlayer.rating} />
                <span className="text-[10px] font-mono-code bg-primary text-white px-2.5 py-0.5 rounded-full font-bold">
                  {currentPlayer.role}
                </span>
              </div>

              {/* Bidding Central Section */}
              <div className="flex-1 flex flex-col items-center gap-3 text-center w-full">
                {/* Live Leader Badge */}
                {leadingBidder === 'you' && (
                  <div className="inline-flex items-center gap-1.5 bg-pitch-green/10 border border-pitch-green/30 text-pitch-green px-3 py-1 rounded-full text-xs font-headline font-bold">
                    <span className="w-2 h-2 rounded-full bg-pitch-green animate-pulse" />
                    YOU ARE LEADING
                  </div>
                )}
                {leadingBidder === 'computer' && (
                  <div className="inline-flex items-center gap-1.5 bg-secondary/15 border border-secondary/40 text-secondary px-3 py-1 rounded-full text-xs font-headline font-bold">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                    COMPUTER LEADING
                  </div>
                )}
                {leadingBidder === null && (
                  <div className="inline-flex items-center gap-1.5 bg-surface-container border border-outline-variant text-on-surface-variant px-3 py-1 rounded-full text-xs font-headline font-semibold">
                    AWAITING BIDS
                  </div>
                )}

                <span className="text-[10px] font-mono-code text-on-surface-variant uppercase tracking-wider">
                  Current Bid {openingBidder === 'computer' && leadingBidder === 'computer' && !roundOver ? '(Computer opened)' : ''}
                </span>
                <span className="font-headline font-extrabold text-3xl sm:text-4xl text-primary">
                  🪙 {currentBid}
                </span>

                <div className="flex gap-3 mt-1 w-full sm:w-auto justify-center">
                  <button
                    onClick={handlePass}
                    disabled={roundOver || autoAwardInProgress}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl border border-outline-variant font-headline font-bold text-sm text-on-surface hover:bg-surface-container transition-all disabled:opacity-40"
                  >
                    Pass
                  </button>
                  <button
                    onClick={handleBid}
                    disabled={roundOver || yourFull || (currentBid + 1 > yourWallet)}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-primary text-white font-headline font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 shadow-sm"
                  >
                    Bid 🪙{currentBid + 1}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 bg-surface-container rounded-xl py-2.5 px-4 text-center">
              <span className="text-xs font-body-md text-on-surface-variant font-medium">
                {status}
              </span>
            </div>

            {roundOver && (
              <button
                onClick={() => nextLot(wasUnsoldRound)}
                className="w-full mt-3 bg-secondary text-white font-headline font-bold text-sm py-3 rounded-xl hover:opacity-90 transition-all shadow-sm"
              >
                Next Player →
              </button>
            )}
          </div>
        </div>
      ) : null}

      {!gameOver && currentPlayer && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
          {/* Your Team Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3 border-b border-outline-variant pb-2.5">
              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 font-headline font-bold text-sm text-primary">
                  <span className="material-symbols-outlined text-lg">person</span>
                  Your Team ({yourTeam.length}/{TEAM_SIZE})
                </span>
                <span className="text-[11px] font-headline font-bold text-pitch-green mt-0.5">
                  ⭐ {yourTeamRating} pts
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono-code text-on-surface-variant block uppercase">
                  Purse Left
                </span>
                <span className="text-xs font-mono-code text-primary font-extrabold">
                  🪙{yourWallet}/{BUDGET}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: TEAM_SIZE }).map((_, i) => {
                const entry = yourTeam[i];
                return entry ? (
                  <div key={i} className="flex items-center justify-between bg-primary/5 border border-primary/15 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                        {entry.player.name[0]}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-headline font-bold text-on-surface">
                          {entry.player.name}
                        </span>
                        <span className="text-[10px] text-on-surface-variant">
                          {entry.player.role} · ⭐{entry.player.rating}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono-code text-primary font-bold">🪙{entry.price}</span>
                  </div>
                ) : (
                  <div key={i} className="flex items-center justify-between bg-surface-container/60 border border-dashed border-outline-variant rounded-lg px-3 py-2 text-outline-variant">
                    <span className="text-xs font-body-md text-on-surface-variant/60">Slot {i + 1} (Empty)</span>
                    <span className="text-xs font-mono-code text-outline-variant">+</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Computer Team Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3 border-b border-outline-variant pb-2.5">
              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 font-headline font-bold text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-lg">smart_toy</span>
                  Computer ({computerTeam.length}/{TEAM_SIZE})
                </span>
                <span className="text-[11px] font-headline font-bold text-secondary mt-0.5">
                  ⭐ {computerTeamRating} pts
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono-code text-on-surface-variant block uppercase">
                  Purse Left
                </span>
                <span className="text-xs font-mono-code text-on-surface-variant font-extrabold">
                  🪙{computerWallet}/{BUDGET}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: TEAM_SIZE }).map((_, i) => {
                const entry = computerTeam[i];
                return entry ? (
                  <div key={i} className="flex items-center justify-between bg-surface-container rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-outline text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                        {entry.player.name[0]}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-headline font-bold text-on-surface">
                          {entry.player.name}
                        </span>
                        <span className="text-[10px] text-on-surface-variant">
                          {entry.player.role} · ⭐{entry.player.rating}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono-code text-on-surface-variant font-bold">🪙{entry.price}</span>
                  </div>
                ) : (
                  <div key={i} className="flex items-center justify-between bg-surface-container/60 border border-dashed border-outline-variant rounded-lg px-3 py-2 text-outline-variant">
                    <span className="text-xs font-body-md text-on-surface-variant/60">Slot {i + 1} (Empty)</span>
                    <span className="material-symbols-outlined text-xs text-outline-variant">lock</span>
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
