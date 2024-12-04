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
  const [playPos, setPlayPos] = createSignal(-1);

  let timerId: number;

  const interval = new AccurateInterval(getStepTimeInSecondsForBmp(song.tempo, song.stepsPerBeat), () => {
    setPlayPos((playPos() + 1) % song.pattern[0].steps.length);

    const step = song.pattern[0].steps[playPos()];
    if (step.note) {
      playNote(step.note);
    }
  });

  createEffect(() => {
    if (song.tempo >= 10) {
      interval.intervalSeconds = getStepTimeInSecondsForBmp(song.tempo, song.stepsPerBeat);
    }
  });

  function startPlay() {
    setPlayPos(-1);
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

        <label>
          BeatSize:
          <input
            type="number"
            class={styles.stepsPerBeatInput}
            placeholder="BeatSize"
            value={song.stepsPerBeat}
            onInput={(e) => {
              if (e.currentTarget.valueAsNumber) {
                song.stepsPerBeat = e.currentTarget.valueAsNumber;
              }
            }}
          />
        </label>
        <PatternEditor patternMut={song.pattern[0]} playPos={playPos()} stepsPerBeat={song.stepsPerBeat} />
      </main>
    </div>
  );
};

export default App;
