import type { Component } from 'solid-js';

import styles from './App.module.css';
import { PatternEditor } from './PatternEditor';
import { createMutable, createStore, produce } from 'solid-js/store';
import { Pattern, Song, createEmptyPattern, createEmptySong } from './song';
import { F0 } from './notes';
import { loadSong, saveSong } from './storage';
import { playNote } from './instruments';

const App: Component = () => {
  const song = createMutable<Song>(loadSong() ?? createEmptySong());
  let currentStep = 0;

  let timerId: number;

  function startPlay() {
    stopPlay();
    currentStep = 0;

    timerId = setInterval(() => {
      const step = song.pattern[0].steps[currentStep];
      if (step.note) {
        playNote(step.note);
      }

      currentStep = (currentStep + 1) % song.pattern[0].steps.length;
    }, 200);
  }

  function stopPlay() {
    clearInterval(timerId);
  }

  return (
    <div class={styles.App}>
      <header class={styles.header}>MarcoTracker</header>
      <main>
        <button onClick={() => Object.assign(song, loadSong())}>Load</button>
        <button onClick={() => saveSong(song)}>Save</button>
        <button onClick={startPlay}>Play</button>
        <button onClick={stopPlay}>Stop</button>
        <PatternEditor patternMut={song.pattern[0]} />
      </main>
    </div>
  );
};

export default App;
