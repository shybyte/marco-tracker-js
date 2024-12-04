import { createSignal, type Component, createEffect } from 'solid-js';
import { createMutable } from 'solid-js/store';
import styles from './App.module.css';
import { PatternEditor } from './PatternEditor';
import { playNote } from './instruments';
import { Song, createEmptySong } from './song';
import { loadSong, saveSong } from './storage';
import { AccurateInterval } from './utils/interval';
import { getStepTimeInSecondsForBmp } from './utils/utils';

const App: Component = () => {
  const song = createMutable<Song>(loadSong() ?? createEmptySong());
  const [playPos, setPlayPos] = createSignal(0);
  const [bpm, setBpm] = createSignal(120);
  const stepsPerBeat = 4;

  let timerId: number;

  const interval = new AccurateInterval(getStepTimeInSecondsForBmp(bpm(), stepsPerBeat), () => {
    const step = song.pattern[0].steps[playPos()];
    if (step.note) {
      playNote(step.note);
    }

    setPlayPos((playPos() + 1) % song.pattern[0].steps.length);
  });

  createEffect(() => {
    interval.intervalSeconds = getStepTimeInSecondsForBmp(bpm(), stepsPerBeat);
  });

  function startPlay() {
    setPlayPos(0);
    interval.start();
  }

  function stopPlay() {
    interval.stop();
  }

  return (
    <div class={styles.App}>
      <header class={styles.header}>MarcoTracker</header>
      <main>
        <button onClick={() => Object.assign(song, loadSong())}>Load</button>
        <button onClick={() => saveSong(song)}>Save</button>
        <button onClick={startPlay}>Play</button>
        <button onClick={stopPlay}>Stop</button>

        <label>
          BPM:
          <input type="number" placeholder="BPM" value={bpm()} onInput={(e) => setBpm(e.currentTarget.valueAsNumber)} />
        </label>
        <PatternEditor patternMut={song.pattern[0]} playPos={playPos()} stepsPerBeat={stepsPerBeat} />
      </main>
    </div>
  );
};

export default App;
