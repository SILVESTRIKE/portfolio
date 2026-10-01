/*
Reason for existence: Unified music service aggregating scrobbles from Last.fm, resolving embeddable YouTube videoIds, and caching today's listening telemetry.
System impact if absent: Music widget cannot retrieve live listening activity, historical scrobbles, or audio streaming identifiers.
*/

import { MusicTelemetryResponse, MusicTrackInfo } from '@/types';
import { resolveYouTubeVideoId } from '@/lib/youtube';
import { FALLBACK_TRACK } from '@/lib/musicOverrides';

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_USERNAME = process.env.LASTFM_USERNAME;

interface LastFmImage {
  '#text': string;
  size: string;
}

interface LastFmTrack {
  name: string;
  artist: { '#text': string } | string;
  album: { '#text': string } | string;
  url: string;
  image?: LastFmImage[];
  date?: {
    uts: string;
    '#text': string;
  };
  '@attr'?: {
    nowplaying?: string;
  };
}

interface LastFmResponse {
  recenttracks?: {
    track?: LastFmTrack[] | LastFmTrack;
    '@attr'?: {
      total?: string;
      page?: string;
    };
  };
}

const albumArtCache = new Map<string, string>();

async function fetchAlbumArtFallback(artist: string, title: string): Promise<string> {
  const cacheKey = `${artist.toLowerCase()}:::${title.toLowerCase()}`;
  if (albumArtCache.has(cacheKey)) {
    return albumArtCache.get(cacheKey) || '';
  }

  try {
    const cleanTitle = title.replace(/\s*[\(\[].*?[\)\]]/g, '').trim();
    const query = `${artist} ${cleanTitle}`;
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`,
      { cache: 'no-store' }
    );

    if (res.ok) {
      const data = (await res.json()) as { results?: Array<{ artworkUrl100?: string }> };
      const item = data.results?.[0];
      if (item?.artworkUrl100) {
        // Upgrade 100x100 to 600x600 artwork
        const highRes = item.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg');
        albumArtCache.set(cacheKey, highRes);
        return highRes;
      }
    }
  } catch {
    // Fail silently
  }

  const defaultArt = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80';
  albumArtCache.set(cacheKey, defaultArt);
  return defaultArt;
}

function calculateRelativeTime(utsString?: string): string {
  if (!utsString) return 'just now';
  const playedTimestamp = parseInt(utsString, 10) * 1000;
  if (isNaN(playedTimestamp)) return 'recently';

  const diffSec = Math.max(0, Math.floor((Date.now() - playedTimestamp) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

/**
 * Calculate the epoch timestamp for 00:00:00 today in Vietnam Time (UTC+7).
 */
export function getTodayStartEpochVN(): number {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const vnDate = new Date(utcMs + 7 * 3600 * 1000);
  vnDate.setHours(0, 0, 0, 0);
  const vnMidnightUtcMs = vnDate.getTime() - 7 * 3600 * 1000;
  return Math.floor(vnMidnightUtcMs / 1000);
}

// In-memory cache for API endpoint (20s TTL)
let inMemoryTelemetry: MusicTelemetryResponse | null = null;
let lastTelemetryFetch = 0;
const TELEMETRY_CACHE_TTL_MS = 20000;

export async function getLiveMusicTelemetry(): Promise<MusicTelemetryResponse> {
  const now = Date.now();
  if (inMemoryTelemetry && now - lastTelemetryFetch < TELEMETRY_CACHE_TTL_MS) {
    return inMemoryTelemetry;
  }

  if (!LASTFM_API_KEY || !LASTFM_USERNAME) {
    const fallbackResponse: MusicTelemetryResponse = {
      current: FALLBACK_TRACK,
      today: [FALLBACK_TRACK],
      todayCount: 1,
      timezone: 'Asia/Ho_Chi_Minh (UTC+7)',
      updatedAt: now
    };
    inMemoryTelemetry = fallbackResponse;
    lastTelemetryFetch = now;
    return fallbackResponse;
  }

  try {
    const todayEpoch = getTodayStartEpochVN();
    const endpoint = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(
      LASTFM_USERNAME
    )}&api_key=${encodeURIComponent(LASTFM_API_KEY)}&format=json&limit=50&from=${todayEpoch}&extended=0`;

    const res = await fetch(endpoint, { cache: 'no-store' });
    let tracks: LastFmTrack[] = [];

    if (res.ok) {
      const data = (await res.json()) as LastFmResponse;
      const raw = data.recenttracks?.track;
      if (Array.isArray(raw)) {
        tracks = raw;
      } else if (raw && typeof raw === 'object') {
        tracks = [raw];
      }
    }

    // If no tracks today, fetch recent 10 tracks so visitors still see what you listened to recently
    if (tracks.length === 0) {
      const recentEndpoint = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(
        LASTFM_USERNAME
      )}&api_key=${encodeURIComponent(LASTFM_API_KEY)}&format=json&limit=10&extended=0`;
      const recentRes = await fetch(recentEndpoint, { cache: 'no-store' });
      if (recentRes.ok) {
        const data = (await recentRes.json()) as LastFmResponse;
        const raw = data.recenttracks?.track;
        if (Array.isArray(raw)) {
          tracks = raw;
        } else if (raw && typeof raw === 'object') {
          tracks = [raw];
        }
      }
    }

    // If completely empty, return Iron Man fallback
    if (tracks.length === 0) {
      const fallbackResponse: MusicTelemetryResponse = {
        current: FALLBACK_TRACK,
        today: [FALLBACK_TRACK],
        todayCount: 0,
        timezone: 'Asia/Ho_Chi_Minh (UTC+7)',
        updatedAt: now
      };
      inMemoryTelemetry = fallbackResponse;
      lastTelemetryFetch = now;
      return fallbackResponse;
    }

    // Convert raw tracks to MusicTrackInfo
    const parsedTracks: MusicTrackInfo[] = [];
    let nowPlayingTrack: MusicTrackInfo | null = null;
    let newSearchBudget = 3;

    for (let i = 0; i < tracks.length; i++) {
      const t = tracks[i];
      const isNowPlaying = t['@attr']?.nowplaying === 'true';
      const artistName = typeof t.artist === 'object' ? t.artist['#text'] : t.artist || 'Unknown Artist';
      const albumName = typeof t.album === 'object' ? t.album['#text'] : t.album || 'Single';
      const trackTitle = t.name;

      let artUrl = '';
      if (Array.isArray(t.image) && t.image.length > 0) {
        const extraLarge = t.image.find(img => img.size === 'extralarge');
        const large = t.image.find(img => img.size === 'large');
        artUrl = extraLarge?.['#text'] || large?.['#text'] || t.image[0]['#text'] || '';
      }

      // Check for placeholder image from Last.fm
      if (!artUrl || artUrl.includes('2a96cbd8b46e442fc41c2b86b821562f')) {
        artUrl = await fetchAlbumArtFallback(artistName, trackTitle);
      }

      // Resolve YouTube Video ID (prioritize first 3 tracks with API budget)
      let videoId: string | null = null;
      if (i < 3 || newSearchBudget > 0) {
        videoId = await resolveYouTubeVideoId(artistName, trackTitle);
        if (videoId) newSearchBudget--;
      }

      const playedAtTimestamp = t.date?.uts ? parseInt(t.date.uts, 10) * 1000 : undefined;
      const relative = isNowPlaying ? 'now playing' : calculateRelativeTime(t.date?.uts);

      const parsed: MusicTrackInfo = {
        isPlaying: isNowPlaying,
        title: trackTitle,
        artist: artistName,
        album: albumName,
        albumArt: artUrl,
        songUrl: t.url || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artistName} ${trackTitle}`)}`,
        previewUrl: null,
        progressMs: isNowPlaying ? 30000 : 0,
        durationMs: 210000,
        trackId: `lastfm-${t.date?.uts || 'now'}-${i}`,
        youtubeVideoId: videoId,
        playedAt: playedAtTimestamp,
        relativeTime: relative,
        source: 'lastfm'
      };

      parsedTracks.push(parsed);

      if (isNowPlaying && !nowPlayingTrack) {
        nowPlayingTrack = parsed;
      }
    }

    const current = nowPlayingTrack || parsedTracks[0] || FALLBACK_TRACK;

    const result: MusicTelemetryResponse = {
      current,
      today: parsedTracks,
      todayCount: parsedTracks.length,
      timezone: 'Asia/Ho_Chi_Minh (UTC+7)',
      updatedAt: now
    };

    inMemoryTelemetry = result;
    lastTelemetryFetch = now;
    return result;
  } catch {
    if (inMemoryTelemetry) {
      return inMemoryTelemetry;
    }
    return {
      current: FALLBACK_TRACK,
      today: [FALLBACK_TRACK],
      todayCount: 1,
      timezone: 'Asia/Ho_Chi_Minh (UTC+7)',
      updatedAt: now
    };
  }
}
