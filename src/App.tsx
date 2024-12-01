import type { Component } from 'solid-js';

import styles from './App.module.css';
import { PatternEditor } from './PatternEditor';
import { createMutable, createStore, produce } from 'solid-js/store';
import { Pattern, Song, createEmptyPattern, createEmptySong } from './song';
import { F0 } from './notes';
import { loadSong, saveSong } from './storage';

const App: Component = () => {
  const song = createMutable<Song>(loadSong() ?? createEmptySong());

  return (
    <div class={styles.App}>
      <header class={styles.header}>MarcoTracker</header>
      <main>
        <button onClick={() => saveSong(song)}>Save</button>
        <PatternEditor patternMut={song.pattern[0]} />
      </main>
    </div>
  );
};

export default App;
