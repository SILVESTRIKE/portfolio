/*
Reason for existence: Next.js API Route serving real-time music telemetry, today's listening history, and YouTube playback videoIds via Last.fm scrobbler.
System impact if absent: Client-side music player cannot fetch live listening status or today's track playlist.
*/

import { NextRequest, NextResponse } from 'next/server';
import { getLiveMusicTelemetry } from '@/lib/music';
import { resolveYouTubeVideoId } from '@/lib/youtube';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const artist = searchParams.get('artist');
  const title = searchParams.get('title');

  if (artist && title) {
    const videoId = await resolveYouTubeVideoId(artist, title);
    return NextResponse.json({ videoId }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  }

  const telemetry = await getLiveMusicTelemetry();

  return NextResponse.json(telemetry, {
    headers: {
      'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=30'
    }
  });
}
