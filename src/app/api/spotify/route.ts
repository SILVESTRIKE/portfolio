/*
Reason for existence: Legacy API Route adapter proxying to unified music telemetry engine without Spotify Web API dependencies.
System impact if absent: Any legacy clients querying /api/spotify will fail to receive the current track.
*/

import { NextResponse } from 'next/server';
import { getLiveMusicTelemetry } from '@/lib/music';

export async function GET() {
  const telemetry = await getLiveMusicTelemetry();

  return NextResponse.json(telemetry.current, {
    headers: {
      'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=30'
    }
  });
}
