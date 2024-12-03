import { createSignal, type Component } from 'solid-js';
import { createMutable } from 'solid-js/store';
import styles from './App.module.css';
import { PatternEditor } from './PatternEditor';
import { playNote } from './instruments';
import { Song, createEmptySong } from './song';
import { loadSong, saveSong } from './storage';

const App: Component = () => {
  const song = createMutable<Song>(loadSong() ?? createEmptySong());
  let [playPos, setPlayPos] = createSignal(0);
  const stepsPerBeat = 4;

  let timerId: number;

  function startPlay() {
    stopPlay();
    setPlayPos(0);

    timerId = setInterval(() => {
      const step = song.pattern[0].steps[playPos()];
      if (step.note) {
        playNote(step.note);
      }

      setPlayPos((playPos() + 1) % song.pattern[0].steps.length);
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
        <PatternEditor patternMut={song.pattern[0]} playPos={playPos()} stepsPerBeat={stepsPerBeat} />
      </main>
    </div>
  );
};

export default App;
