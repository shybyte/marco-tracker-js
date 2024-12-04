import { createEffect, createSignal, type Component } from 'solid-js';
import { createMutable } from 'solid-js/store';
import styles from './App.module.css';
import { PatternEditor } from './PatternEditor';
import { NumberInput } from './components/NumberInput';
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
    setPlayPos((playPos() + 1) % song.patternLength);

    const step = song.pattern[0].steps[playPos()];
    if (step?.note) {
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
        <div role="toolbar">
          <button onClick={() => Object.assign(song, loadSong())}>Load</button>
          <button onClick={() => saveSong(song)}>Save</button>
          <button onClick={startPlay}>Play</button>
          <button onClick={stopPlay}>Stop</button>

          <NumberInput value={song.tempo} label="BPM" width={3} setValue={(value) => (song.tempo = value)} />

          <NumberInput
            value={song.stepsPerBeat}
            label="BeatSize"
            width={2}
            setValue={(value) => (song.stepsPerBeat = value)}
          />

          <NumberInput
            value={song.patternLength}
            label="PatternLength"
            width={3}
            setValue={(value) => (song.patternLength = value)}
          />
        </div>

        <PatternEditor
          patternMut={song.pattern[0]}
          playPos={playPos()}
          stepsPerBeat={song.stepsPerBeat}
          patternLength={song.patternLength}
        />
      </main>
    </div>
  );
};

export default App;
