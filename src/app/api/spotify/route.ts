/*
Reason for existence: Next.js API Route Handler serving real-time Spotify currently-playing track telemetry to the WebOS client.
System impact if absent: Client-side Spotify player and top panel widget cannot fetch track status or stream URLs.
*/

import { NextResponse } from 'next/server';
import { getLiveSpotifyTrack } from '@/lib/spotify';

export async function GET() {
  const track = await getLiveSpotifyTrack();
  return NextResponse.json(track, {
    headers: {
      'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10'
    }
  });
}
