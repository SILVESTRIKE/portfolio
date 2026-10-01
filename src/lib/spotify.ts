/*
Reason for existence: Backward-compatibility adapter re-exporting live music telemetry functions.
System impact if absent: Any legacy modules importing from @/lib/spotify will trigger build errors.
*/

import { getLiveMusicTelemetry } from '@/lib/music';
import { MusicTrackInfo } from '@/types';

export async function getLiveSpotifyTrack(): Promise<MusicTrackInfo> {
  const telemetry = await getLiveMusicTelemetry();
  return telemetry.current;
}
