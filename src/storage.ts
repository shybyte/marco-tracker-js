import { normalizeSong, Song } from './song';

export function loadSong(): Song | undefined {
  const storedString = localStorage.getItem('marcotracker.song');
  if (!storedString) {
    return undefined;
  }

  try {
    return normalizeSong(JSON.parse(storedString) as Song);
  } catch (error) {
    console.error('Failed to load song', error);
    return undefined;
  }
}

export function saveSong(song: Song) {
  localStorage.setItem('marcotracker.song', JSON.stringify(song));
}
