/*
Reason for existence: Next.js API Route serving real-time music telemetry: Last.fm scrobbler → NCT Music stream → static fallback.
System impact if absent: Client-side music player cannot fetch live track status or NCT stream URLs.
*/

import { NextResponse } from 'next/server';
import { getLiveSpotifyTrack } from '@/lib/spotify';
import { fetchFromNct } from '@/lib/nct';

export async function GET() {
  // 1. Last.fm scrobbler (shows what user is actually listening to)
  const lastFmTrack = await getLiveSpotifyTrack();

  // If Last.fm returned something real (not the hardcoded fallback), use it
  if (lastFmTrack.trackId !== '7MXVkk9YM5FZxhsqOYGmB2') {
    return NextResponse.json(lastFmTrack, {
      headers: { 'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10' }
    });
  }

  // 2. NCT Music curated stream (Vietnamese full-length songs)
  const nctTrack = await fetchFromNct();
  if (nctTrack) {
    return NextResponse.json(nctTrack, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' }
    });
  }

  // 3. Static fallback
  return NextResponse.json(lastFmTrack, {
    headers: { 'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10' }
  });
}
