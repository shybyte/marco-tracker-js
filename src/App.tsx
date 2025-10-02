import { For, createEffect, createSignal, onCleanup, onMount, type Component } from 'solid-js';
import { createMutable } from 'solid-js/store';
import styles from './App.module.css';
import { PatternEditor } from './PatternEditor';
import { NumberInput } from './components/NumberInput';
import {
  getPlaybackMode,
  getSelectedMidiOutputId,
  playNote,
  refreshMidiOutputs,
  setPlaybackMode,
  setSelectedMidiOutput,
  subscribeMidiOutputs,
  type MidiOutputInfo,
} from './instruments';
import { Song, createEmptySong } from './song';
import { loadSong, saveSong } from './storage';
import { AccurateInterval } from './utils/interval';
import { getStepTimeInSecondsForBmp } from './utils/utils';

const App: Component = () => {
  const song = createMutable<Song>({ ...createEmptySong(), ...loadSong() });
  const [playPos, setPlayPos] = createSignal(-1);
  const [midiOutputs, setMidiOutputs] = createSignal<MidiOutputInfo[]>([]);
  const [selectedOutput, setSelectedOutput] = createSignal<string>(
    getPlaybackMode() === 'internal' ? 'internal' : getSelectedMidiOutputId() ?? 'internal',
  );
  const [recordMode, setRecordMode] = createSignal(false);

  let timerId: number;

  const interval = new AccurateInterval(getStepTimeInSecondsForBmp(song.tempo, song.stepsPerBeat), () => {
    setPlayPos((playPos() + 1) % song.patternLength);

    const step = song.pattern[0].steps[playPos()];
    step?.notes?.forEach((note) => {
      playNote(song.instruments[0], note);
    });
  });

  createEffect(() => {
    if (song.tempo >= 10) {
      interval.intervalSeconds = getStepTimeInSecondsForBmp(song.tempo, song.stepsPerBeat);
    }
  });

  onMount(() => {
    const unsubscribe = subscribeMidiOutputs((outputs) => setMidiOutputs(outputs));
    refreshMidiOutputs();
    onCleanup(unsubscribe);
  });

  createEffect(() => {
    const selection = selectedOutput();

    if (selection === 'internal') {
      setPlaybackMode('internal');
      return;
    }

    setSelectedMidiOutput(selection);
    setPlaybackMode('midi');
  });

  createEffect(() => {
    const outputs = midiOutputs();
    const selection = selectedOutput();

    if (selection !== 'internal' && !outputs.some((output) => output.id === selection)) {
      if (outputs.length > 0) {
        setSelectedOutput(outputs[0].id);
      } else {
        setSelectedOutput('internal');
      }
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

          <label>
            Output
            <select
              value={selectedOutput()}
              onChange={(event) => setSelectedOutput(event.currentTarget.value)}
              onFocus={() => refreshMidiOutputs()}
            >
              <option value="internal">Internal</option>
              <For each={midiOutputs()}>
                {(output) => {
                  const manufacturer = output.manufacturer ? ` (${output.manufacturer})` : '';
                  return (
                    <option value={output.id}>
                      {output.name}
                      {manufacturer}
                    </option>
                  );
                }}
              </For>
            </select>
          </label>

          <label>
            Record
            <input type="checkbox" checked={recordMode()} onChange={(event) => setRecordMode(event.currentTarget.checked)} />
          </label>
        </div>

        <PatternEditor
          patternMut={song.pattern[0]}
          playPos={playPos()}
          setPlayPos={setPlayPos}
          recordMode={recordMode()}
          stepsPerBeat={song.stepsPerBeat}
          patternLength={song.patternLength}
          instrument={song.instruments[0]}
        />
      </main>
    </div>
  );
};

export default App;
