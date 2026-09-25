/*
Reason for existence: NCT Music (NhacCuaTui) server-side streaming proxy — fetches full-length song metadata
and stream URLs from NCT's undocumented XML playlist API as a Spotify 30s preview alternative.
System impact if absent: Music player falls back to Spotify/iTunes 30-second previews only; NCT full stream unavailable.
*/

import { SpotifyTrackInfo } from '@/types';

interface NctXmlTrack {
  location: string;
  title: string;
  creator: string;
  image: string;
  link?: string;
}

// Curated Vietnamese playlist: [songKey, title, artist, album]
const NCT_PLAYLIST: Array<[string, string, string, string]> = [
  ['SIWFtgZGmpB', 'Lac Troi', 'Son Tung M-TP', 'M-TP'],
  ['fJm4RQWXZIK', 'Waiting For You', 'MONO', 'Truyen Ngan'],
  ['cJJFllHdmkB', 'Noi Nay Co Anh', 'Son Tung M-TP', 'Sky Tour'],
  ['9Oln0YQfTle', 'Chi Co The La Em', 'Duc Phuc', 'Single'],
  ['7OQRR2Qcxgc', 'Nguoi La Oi', 'Hoang Thuy Linh', 'HT Love'],
];

async function parseNctXml(xml: string): Promise<NctXmlTrack | null> {
  try {
    const locationMatch = xml.match(/<location>([\s\S]*?)<\/location>/);
    const titleMatch = xml.match(/<title>([\s\S]*?)<\/title>/);
    const creatorMatch = xml.match(/<creator>([\s\S]*?)<\/creator>/);
    const imageMatch = xml.match(/<image>([\s\S]*?)<\/image>/);
    const linkMatch = xml.match(/<link>([\s\S]*?)<\/link>/);


    const location = locationMatch?.[1]?.trim() ?? '';
    if (!location) return null;

    return {
      location,
      title: titleMatch?.[1]?.trim() ?? 'Unknown',
      creator: creatorMatch?.[1]?.trim() ?? 'Unknown',
      image: imageMatch?.[1]?.trim() ?? '',
      link: linkMatch?.[1]?.trim() ?? '',
    };
  } catch {
    return null;
  }
}

async function fetchNctStream(songKey: string): Promise<NctXmlTrack | null> {
  try {
    const res = await fetch(
      `https://www.nhaccuatui.com/flash/xml?playlist=${songKey}`,
      {
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          Referer: 'https://www.nhaccuatui.com/',
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!res.ok) return null;
    const xml = await res.text();
    return parseNctXml(xml);
  } catch {
    return null;
  }
}

export async function fetchFromNct(query?: string): Promise<SpotifyTrackInfo | null> {
  // Try NCT search if query provided
  if (query) {
    try {
      const searchRes = await fetch(
        `https://www.nhaccuatui.com/ajax/search.json?q=${encodeURIComponent(query)}&page=1&type=song`,
        {
          cache: 'no-store',
          headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
            Referer: 'https://www.nhaccuatui.com/',
            'X-Requested-With': 'XMLHttpRequest',
          },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (searchRes.ok) {
        const data = await searchRes.json() as {
          data?: Array<{ key: string; title: string; artist_name: string; thumbnail: string; }>;
        };
        const first = data.data?.[0];
        if (first?.key) {
          const stream = await fetchNctStream(first.key);
          if (stream?.location) {
            return {
              isPlaying: true,
              title: first.title,
              artist: first.artist_name,
              album: 'NCT Music',
              albumArt: first.thumbnail,
              songUrl: `https://www.nhaccuatui.com/bai-hat/${first.key}.html`,
              previewUrl: stream.location,
              progressMs: 0,
              durationMs: 0,
              trackId: `nct-${first.key}`,
            };
          }
        }
      }
    } catch {
      // Fall through to curated playlist
    }
  }

  // Rotate through curated playlist by hour
  const index = new Date().getHours() % NCT_PLAYLIST.length;
  const [songKey, title, artist, album] = NCT_PLAYLIST[index];

  const stream = await fetchNctStream(songKey);
  if (stream?.location) {
    return {
      isPlaying: true,
      title: stream.title || title,
      artist: stream.creator || artist,
      album,
      albumArt: stream.image || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=300&q=80',
      songUrl: stream.link || `https://www.nhaccuatui.com/bai-hat/${songKey}.html`,
      previewUrl: stream.location,
      progressMs: 0,
      durationMs: 0,
      trackId: `nct-${songKey}`,
    };
  }

  // NCT unavailable — return null so caller uses its own fallback
  return null;
}
