import { Song } from './song';

export function loadSong(): Song | undefined {
  const storedString = localStorage.getItem('marcotracker.song');

  if (!storedString) {
    return undefined;
  }

  return JSON.parse(storedString);
}

export function saveSong(song: Song) {
  localStorage.setItem('marcotracker.song', JSON.stringify(song));
}
