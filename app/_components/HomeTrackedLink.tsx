'use client';

import Link from 'next/link';
import { track, type AnalyticsEvent } from '@/lib/analytics';

interface HomeTrackedLinkProps {
  href: string;
  id?: string;
  event: AnalyticsEvent;
  eventProps?: Record<string, unknown>;
  className?: string;
  children: React.ReactNode;
}

export function HomeTrackedLink({
  href,
  id,
  event,
  eventProps,
  className,
  children,
}: HomeTrackedLinkProps) {
  return (
    <Link
      id={id}
      href={href}
      onClick={() => track(event, eventProps)}
      className={className}
    >
      {children}
    </Link>
  );
}
