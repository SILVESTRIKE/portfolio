/*
Reason for existence: Music streaming and now-playing telemetry engine supporting Last.fm Scrobbler API (free Spotify scrobbler) and Spotify Web API with audio preview streaming.
System impact if absent: Server cannot fetch real-time music listening activity or audio previews for the portfolio live status.
*/

import { SpotifyTrackInfo } from '@/types';

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_USERNAME = process.env.LASTFM_USERNAME;

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const SPOTIFY_NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing';
const SPOTIFY_RECENTLY_PLAYED_ENDPOINT = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyArtist {
  name: string;
}

interface SpotifyImage {
  url: string;
}

interface SpotifyItem {
  id: string;
  name: string;
  duration_ms: number;
  preview_url: string | null;
  artists: SpotifyArtist[];
  album: {
    name: string;
    images: SpotifyImage[];
  };
  external_urls: {
    spotify: string;
  };
}

interface SpotifyPlayingResponse {
  is_playing: boolean;
  progress_ms: number;
  item: SpotifyItem | null;
}

interface SpotifyRecentResponse {
  items: Array<{
    track: SpotifyItem;
    played_at: string;
  }>;
}

interface LastFmImage {
  '#text': string;
  size: string;
}

interface LastFmTrack {
  name: string;
  artist: {
    '#text': string;
  } | string;
  album: {
    '#text': string;
  } | string;
  url: string;
  image?: LastFmImage[];
  '@attr'?: {
    nowplaying?: string;
  };
}

interface LastFmResponse {
  recenttracks?: {
    track?: LastFmTrack[] | LastFmTrack;
  };
}

async function getSpotifyAccessToken(): Promise<string | null> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    return null;
  }

  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  try {
    const res = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: SPOTIFY_REFRESH_TOKEN
      }),
      cache: 'no-store'
    });

    if (!res.ok) return null;
    const data = (await res.json()) as SpotifyTokenResponse;
    return data.access_token;
  } catch {
    return null;
  }
}

async function fetchRealAudioPreview(artist: string, title: string): Promise<string | null> {
  try {
    const cleanTitle = title
      .replace(/\s*[\(\[].*?[\)\]]/g, '')
      .replace(/-\s*slowed.*/i, '')
      .replace(/-\s*speed up.*/i, '')
      .trim();

    const searchQueries = [
      `${artist} ${cleanTitle}`,
      `${artist} ${title}`,
      cleanTitle
    ];

    for (const q of searchQueries) {
      if (!q.trim()) continue;
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=1`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const data = await res.json();
        const first = data.results?.[0];
        if (first?.previewUrl) {
          return first.previewUrl;
        }
      }
    }

    const deezerRes = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(artist + ' ' + cleanTitle)}&limit=1`,
      { cache: 'no-store' }
    );
    if (deezerRes.ok) {
      const data = await deezerRes.json();
      if (data.data?.[0]?.preview) {
        return data.data[0].preview;
      }
    }
  } catch {
    // Fallback
  }
  return null;
}

async function fetchFromLastFm(): Promise<SpotifyTrackInfo | null> {
  if (!LASTFM_API_KEY || !LASTFM_USERNAME) {
    return null;
  }

  try {
    const endpoint = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(
      LASTFM_USERNAME
    )}&api_key=${encodeURIComponent(LASTFM_API_KEY)}&format=json&limit=1`;

    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) return null;

    const data = (await res.json()) as LastFmResponse;
    const tracks = data.recenttracks?.track;
    if (!tracks) return null;

    const current = Array.isArray(tracks) ? tracks[0] : tracks;
    if (!current || !current.name) return null;

    const isNowPlaying = current['@attr']?.nowplaying === 'true';
    const artistName = typeof current.artist === 'object' ? current.artist['#text'] : current.artist;
    const albumName = typeof current.album === 'object' ? current.album['#text'] : current.album;
    
    let artUrl = '';
    if (Array.isArray(current.image) && current.image.length > 0) {
      const extraLarge = current.image.find(img => img.size === 'extralarge');
      const large = current.image.find(img => img.size === 'large');
      artUrl = extraLarge?.['#text'] || large?.['#text'] || current.image[0]['#text'] || '';
    }

    const realAudioUrl = await fetchRealAudioPreview(artistName || '', current.name || '');

    return {
      isPlaying: isNowPlaying,
      title: current.name,
      artist: artistName || 'Unknown Artist',
      album: albumName || 'Single / Unknown Album',
      albumArt: artUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=300&q=80',
      songUrl: current.url || `https://open.spotify.com/search/${encodeURIComponent(current.name)}`,
      previewUrl: realAudioUrl || 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e5/3a/86/e53a8652-5a22-00e3-df77-b4034a12032e/mzaf_14907648312317330850.plus.aac.p.m4a',
      progressMs: 30000,
      durationMs: 210000,
      trackId: `lastfm-${Date.now()}`
    };
  } catch {
    return null;
  }
}

export async function getLiveSpotifyTrack(): Promise<SpotifyTrackInfo> {
  // 1. Try Last.fm Scrobbler first (works without Spotify Premium!)
  const lastFmTrack = await fetchFromLastFm();
  if (lastFmTrack) {
    return lastFmTrack;
  }

  // 2. Try Spotify Official Web API
  const token = await getSpotifyAccessToken();
  if (token) {
    try {
      const currentRes = await fetch(SPOTIFY_NOW_PLAYING_ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });

      if (currentRes.status === 200) {
        const data = (await currentRes.json()) as SpotifyPlayingResponse;
        if (data.item) {
          const artistName = data.item.artists.map(a => a.name).join(', ');
          const realAudio = data.item.preview_url || (await fetchRealAudioPreview(artistName, data.item.name));
          return {
            isPlaying: data.is_playing,
            title: data.item.name,
            artist: artistName,
            album: data.item.album.name,
            albumArt: data.item.album.images[0]?.url || '',
            songUrl: data.item.external_urls.spotify,
            previewUrl: realAudio,
            progressMs: data.progress_ms,
            durationMs: data.item.duration_ms,
            trackId: data.item.id
          };
        }
      }

      const recentRes = await fetch(SPOTIFY_RECENTLY_PLAYED_ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });

      if (recentRes.status === 200) {
        const data = (await recentRes.json()) as SpotifyRecentResponse;
        const recent = data.items[0]?.track;
        if (recent) {
          const artistName = recent.artists.map(a => a.name).join(', ');
          const realAudio = recent.preview_url || (await fetchRealAudioPreview(artistName, recent.name));
          return {
            isPlaying: false,
            title: recent.name,
            artist: artistName,
            album: recent.album.name,
            albumArt: recent.album.images[0]?.url || '',
            songUrl: recent.external_urls.spotify,
            previewUrl: realAudio,
            progressMs: 0,
            durationMs: recent.duration_ms,
            trackId: recent.id
          };
        }
      }
    } catch {
      // Fallback
    }
  }

  // 3. Fallback track with real audio preview
  return {
    isPlaying: true,
    title: 'Starboy (Live Radio Stream)',
    artist: 'The Weeknd, Daft Punk',
    album: 'Starboy',
    albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=300&q=80',
    songUrl: 'https://open.spotify.com/track/7MXVkk9YM5FZxhsqOYGmB2',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e5/3a/86/e53a8652-5a22-00e3-df77-b4034a12032e/mzaf_14907648312317330850.plus.aac.p.m4a',
    progressMs: 45000,
    durationMs: 230453,
    trackId: '7MXVkk9YM5FZxhsqOYGmB2'
  };
}
