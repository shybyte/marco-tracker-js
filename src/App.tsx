import { For, Show, createEffect, createSignal, onCleanup, onMount, type Component } from 'solid-js';
import { createMutable } from 'solid-js/store';
import styles from './App.module.css';
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
import { PatternMatrix } from './PatternMatrix';
import { FrameEditor } from './FrameEditor';

const App: Component = () => {
  const song = createMutable<Song>({ ...createEmptySong(), ...loadSong() });
  const [playPos, setPlayPos] = createSignal(-1);
  const [midiOutputs, setMidiOutputs] = createSignal<MidiOutputInfo[]>([]);
  const [selectedOutput, setSelectedOutput] = createSignal<string>(
    getPlaybackMode() === 'internal' ? 'internal' : getSelectedMidiOutputId() ?? 'internal',
  );
  const [recordMode, setRecordMode] = createSignal(false);
  const [selectedFrameIndex, setSelectedFrameIndex] = createSignal(0);

  let timerId: number;

  const interval = new AccurateInterval(getStepTimeInSecondsForBmp(song.tempo, song.stepsPerBeat), () => {
    setPlayPos((playPos() + 1) % song.patternLength);
    const currentFrame = song.frames[selectedFrameIndex()];
    if (!currentFrame) {
      return;
    }

    const firstPatternId = currentFrame.channels[0];
    if (firstPatternId === null || firstPatternId === undefined) {
      return;
    }

    const pattern = song.patterns.find((candidatePattern) => candidatePattern.id === firstPatternId);
    const instrument = song.instruments[0];

    const step = pattern?.steps[playPos()];
    step?.notes?.forEach((note) => {
      playNote(instrument, note);
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

  createEffect(() => {
    const framesLength = song.frames.length;
    if (framesLength === 0) {
      setSelectedFrameIndex(0);
      return;
    }
    const currentSelection = selectedFrameIndex();
    if (currentSelection >= framesLength) {
      setSelectedFrameIndex(framesLength - 1);
    }
  });

  const currentFrame = () => song.frames[selectedFrameIndex()];

  return (
    <div class={styles.App}>
      <header class={styles.header}>MarcoTracker</header>
      <main class={styles.main}>
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
            <input
              type="checkbox"
              checked={recordMode()}
              onChange={(event) => setRecordMode(event.currentTarget.checked)}
            />
          </label>
        </div>
        <div class={styles.editorLayout}>
          <PatternMatrix
            frames={song.frames}
            selectedFrame={selectedFrameIndex()}
            onSelectFrame={(index) => setSelectedFrameIndex(index)}
          />
          <Show when={currentFrame()} fallback={<div class={styles.framePlaceholder}>No frame selected</div>}>
            {(frame) => (
              <FrameEditor
                frame={frame()}
                patterns={song.patterns}
                instruments={song.instruments}
                patternLength={song.patternLength}
                playPos={playPos()}
                setPlayPos={setPlayPos}
                recordMode={recordMode()}
                stepsPerBeat={song.stepsPerBeat}
              />
            )}
          </Show>
        </div>
      </main>
    </div>
  );
};

export default App;
