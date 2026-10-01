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

/**
 * Curated manual overrides to guarantee 100% correct official audio / topic versions
 * and bypass YouTube search completely.
 */
export const MUSIC_OVERRIDES: Record<string, string> = {
  // Black Sabbath - Iron Man (Official Audio)
  'black sabbath:::iron man': '5s7_WbiR79E',
  'black sabbath:::iron man - 2009 remaster': '5s7_WbiR79E',
  'black sabbath:::iron man (2009 remaster)': '5s7_WbiR79E',

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
  songUrl: 'https://www.youtube.com/watch?v=5s7_WbiR79E',
  previewUrl: null,
  progressMs: 0,
  durationMs: 355000,
  trackId: 'fallback-ironman',
  youtubeVideoId: process.env.FALLBACK_MUSIC_VIDEO_ID || '5s7_WbiR79E',
  source: 'fallback'
};
