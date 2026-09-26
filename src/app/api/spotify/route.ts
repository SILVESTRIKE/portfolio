/*
Reason for existence: Next.js API Route serving real-time music telemetry with YouTube audio resolution: Spotify / Last.fm scrobbler → static fallback.
System impact if absent: Client-side music player cannot fetch live track status or YouTube audio IDs.
*/

import { NextResponse } from 'next/server';
import { getLiveSpotifyTrack } from '@/lib/spotify';

export async function GET() {
  const track = await getLiveSpotifyTrack();

  return NextResponse.json(track, {
    headers: { 'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10' }
  });
}
