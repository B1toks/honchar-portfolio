'use client';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

/* Owner-visit filter: run `localStorage.setItem('va-disable', '1')`
   once in your own browser's console on honchar.dev — every visit
   from that browser is then dropped before it reaches Vercel, so
   deploy-checks don't pollute visitor stats. */
function isOwnerVisit() {
  try {
    return window.localStorage.getItem('va-disable') === '1';
  } catch {
    return false;
  }
}

export function AnalyticsClient() {
  return (
    <>
      <Analytics beforeSend={(event) => (isOwnerVisit() ? null : event)} />
      <SpeedInsights beforeSend={(data) => (isOwnerVisit() ? null : data)} />
    </>
  );
}
