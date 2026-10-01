/*
Reason for existence: Static curated videoId override dictionary and fallback definition for music resolver.
System impact if absent: System cannot correct misidentified YouTube videos or provide guaranteed fallback when no scrobbles exist.
*/

import { MusicTrackInfo } from '@/types';

export function normalizeMusicKey(artist: string, title: string): string {
  const cleanArtist = artist.trim().toLowerCase();
  const cleanTitle = title
    .toLowerCase()
    .replace(/\s*[\(\[].*?[\)\]]/g, '')
    .replace(/-\s*slowed.*/i, '')
    .replace(/-\s*speed up.*/i, '')
    .replace(/-\s*remix.*/i, '')
    .trim();

  return `${cleanArtist}:::${cleanTitle}`;
}

export const IRON_MAN_FALLBACK_IDS: string[] = [
  'kBVIDGxSKX8', // Black Sabbath - Iron Man (2009 Remaster)
  'b3-QqGVt-tM', // Black Sabbath - Iron Man (2012 Remaster)
  'Jw1EXRK3Ijw', // Black Sabbath - Iron Man (Audio)
  'F3uM8LEwdOw', // Iron Man (2009 - Remaster)
  'PXjdphD-NoE'  // Black Sabbath - Iron Man - HQ
];

export const DEFAULT_FALLBACK_VIDEO_ID = IRON_MAN_FALLBACK_IDS[0];

/**
 * Curated manual overrides to guarantee 100% correct official audio / topic versions
 * and bypass YouTube search completely.
 */
export const MUSIC_OVERRIDES: Record<string, string> = {
  // Black Sabbath - Iron Man (Official Audio - Multi-Candidate Validated)
  'black sabbath:::iron man': DEFAULT_FALLBACK_VIDEO_ID,
  'black sabbath:::iron man - 2009 remaster': DEFAULT_FALLBACK_VIDEO_ID,
  'black sabbath:::iron man (2009 remaster)': DEFAULT_FALLBACK_VIDEO_ID,

  // The Weeknd - Starboy
  'the weeknd:::starboy': '34Na4j8AVgA',
  'the weeknd, daft punk:::starboy': '34Na4j8AVgA',

  // AC/DC - Shoot to Thrill (Iron Man 2 Version)
  'ac/dc:::shoot to thrill': '4gDch1p4c_M',

  // Ramin Djawadi - Driving With The Top Down (Iron Man OST)
  'ramin djawadi:::driving with the top down': '6Z1uA2FpUuo',
  'ramin djawadi:::iron man': '6Z1uA2FpUuo'
};

export const FALLBACK_TRACK: MusicTrackInfo = {
  isPlaying: false,
  title: 'Iron Man',
  artist: 'Black Sabbath',
  album: 'Paranoid (2009 Remaster)',
  albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
  songUrl: `https://www.youtube.com/watch?v=${DEFAULT_FALLBACK_VIDEO_ID}`,
  previewUrl: null,
  progressMs: 0,
  durationMs: 355000,
  trackId: 'fallback-ironman',
  youtubeVideoId: process.env.FALLBACK_MUSIC_VIDEO_ID || DEFAULT_FALLBACK_VIDEO_ID,
  source: 'fallback'
};
