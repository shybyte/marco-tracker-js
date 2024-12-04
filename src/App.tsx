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
  const stepsPerBeat = 4;

  let timerId: number;

  const interval = new AccurateInterval(getStepTimeInSecondsForBmp(song.tempo, stepsPerBeat), () => {
    const step = song.pattern[0].steps[playPos()];
    if (step.note) {
      playNote(step.note);
    }

    setPlayPos((playPos() + 1) % song.pattern[0].steps.length);
  });

  createEffect(() => {
    if (song.tempo > 20) {
      interval.intervalSeconds = getStepTimeInSecondsForBmp(song.tempo, stepsPerBeat);
    }
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
          <input
            type="number"
            class={styles.bpmInput}
            placeholder="BPM"
            value={song.tempo}
            onInput={(e) => {
              if (e.currentTarget.valueAsNumber) {
                song.tempo = e.currentTarget.valueAsNumber;
              }
            }}
          />
        </label>
        <PatternEditor patternMut={song.pattern[0]} playPos={playPos()} stepsPerBeat={stepsPerBeat} />
      </main>
    </div>
  );
};

export default App;
