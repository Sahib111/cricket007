'use client';

import { useState, useMemo } from 'react';
import { triviaFacts } from '@/lib/triviaData';
import type { TriviaCategory } from '@/lib/triviaData';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns a deterministic 1-based day-of-year value for the local date. */
function getDayOfYear(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

const CATEGORY_META: Record<
  TriviaCategory,
  {
    label: string;
    icon: string;
    // Light-surface modal chips
    colour: string;
    bg: string;
    // Dark-card chips
    cardColour: string;
    cardBg: string;
  }
> = {
  history: {
    label: 'History',
    icon: 'history_edu',
    colour: 'text-primary',
    bg: 'bg-primary/10',
    cardColour: 'text-[#b5c4ff]',
    cardBg: 'bg-white/10',
  },
  records: {
    label: 'Records',
    icon: 'emoji_events',
    colour: 'text-secondary',
    bg: 'bg-secondary/10',
    cardColour: 'text-[#ffb5a0]',
    cardBg: 'bg-white/10',
  },
  laws: {
    label: 'Laws',
    icon: 'gavel',
    colour: 'text-[#006A50]',
    bg: 'bg-[#006A50]/10',
    cardColour: 'text-[#6effd4]',
    cardBg: 'bg-white/10',
  },
  stats: {
    label: 'Statistics',
    icon: 'bar_chart',
    colour: 'text-tertiary',
    bg: 'bg-tertiary/10',
    cardColour: 'text-[#ffb59f]',
    cardBg: 'bg-white/10',
  },
};

// ─── Modal (light-themed, stays readable) ────────────────────────────────────

interface TriviaModalProps {
  isOpen: boolean;
  onClose: () => void;
  fact: (typeof triviaFacts)[number];
}

function TriviaModal({ isOpen, onClose, fact }: TriviaModalProps) {
  if (!isOpen) return null;
  const meta = CATEGORY_META[fact.category];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-xl max-w-lg w-full p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Trivia detail"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Lightbulb badge */}
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-primary text-xl"
                aria-hidden="true"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lightbulb
              </span>
            </div>
            <h2 className="font-headline font-bold text-lg text-primary leading-tight">
              Did You Know?
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close trivia detail"
            className="text-on-surface-variant hover:text-on-surface transition-colors rounded-full p-1 -mt-1 -mr-1"
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        {/* Fact body */}
        <p className="font-body-md text-base text-on-surface leading-relaxed">{fact.fact}</p>

        {/* Context row */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {/* Category chip */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-headline font-bold ${meta.bg} ${meta.colour}`}
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{ fontSize: '14px' }}
            >
              {meta.icon}
            </span>
            {meta.label}
          </span>

          {/* Year / context */}
          <span className="text-xs font-mono-code text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
            {fact.yearOrContext}
          </span>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-primary text-white font-headline font-bold text-sm hover:opacity-90 transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DailyTriviaBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  /** Deterministic selection — same fact all day, rotates daily at midnight. */
  const todaysFact = useMemo(() => {
    const day = getDayOfYear();
    return triviaFacts[day % triviaFacts.length];
  }, []);

  const meta = CATEGORY_META[todaysFact.category];

  return (
    <>
      {/* ── Card ── */}
      <button
        type="button"
        id="daily-trivia-bar"
        aria-label="Today's trivia — click to learn more"
        onClick={() => setIsModalOpen(true)}
        className="
          group w-full text-left
          bg-[linear-gradient(135deg,#001a52_0%,#002880_45%,#0a1f6e_100%)]
          border border-white/10
          rounded-xl py-5 px-5 sm:py-6 sm:px-7
          flex items-start gap-4
          shadow-lg hover:shadow-[0_8px_32px_rgba(0,40,128,0.45)]
          hover:brightness-110
          transition-all duration-200 cursor-pointer
          relative overflow-hidden
        "
      >
        {/* Subtle radial glow behind icon */}
        <div
          className="absolute top-0 left-0 w-40 h-40 rounded-full opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #4d80ff 0%, transparent 70%)',
            transform: 'translate(-20%, -30%)',
          }}
          aria-hidden="true"
        />

        {/* Icon badge */}
        <div
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/15 border border-white/20 flex items-center justify-center shrink-0 mt-0.5 shadow-inner"
          aria-hidden="true"
        >
          <span
            className="material-symbols-outlined text-yellow-300 text-xl sm:text-2xl drop-shadow-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            lightbulb
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Label row */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-headline font-bold text-xs text-white/50 uppercase tracking-widest">
              Today&rsquo;s Trivia
            </h3>
            {/* Category chip — dark card version */}
            <span
              className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold border border-white/10 ${meta.cardBg} ${meta.cardColour} shrink-0`}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{ fontSize: '12px' }}
              >
                {meta.icon}
              </span>
              {meta.label}
            </span>
          </div>

          {/* Heading */}
          <p className="font-headline font-bold text-white text-base sm:text-lg leading-snug mb-1.5">
            Did You Know?
          </p>

          {/* Fact preview */}
          <p className="font-body-md text-sm sm:text-base text-white/80 leading-relaxed line-clamp-2">
            {todaysFact.fact}
          </p>

          {/* Read more + context */}
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <span className="font-headline font-bold text-xs text-yellow-300 group-hover:underline transition-all flex items-center">
              Read more
              <span
                className="material-symbols-outlined align-middle ml-0.5 group-hover:translate-x-0.5 inline-block transition-transform"
                aria-hidden="true"
                style={{ fontSize: '14px' }}
              >
                arrow_forward
              </span>
            </span>
            <span className="text-[11px] font-mono-code text-white/40 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
              {todaysFact.yearOrContext}
            </span>
          </div>
        </div>
      </button>

      {/* ── Detail Modal ── */}
      <TriviaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fact={todaysFact}
      />
    </>
  );
}
