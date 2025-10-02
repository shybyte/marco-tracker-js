import { Accessor, Index, Setter, Show, createSignal } from 'solid-js';
import cssClasses from './PatternEditor.module.css';
import { playNote } from './instruments';
import {
  A0,
  A_1,
  B0,
  B_1,
  C0,
  C1,
  C3,
  C4,
  C_1,
  Cis0,
  Cis1,
  Cis_1,
  D0,
  D1,
  D_1,
  Dis0,
  Dis1,
  Dis_1,
  E0,
  E1,
  E_1,
  F0,
  F1,
  F_1,
  Fis0,
  Fis1,
  Fis_1,
  G0,
  G1,
  G_1,
  Gis0,
  Gis_1,
  H0,
  H_1,
  getMidiNoteName,
} from './notes';
import { Note, Pattern, PatternStep } from './song';
import { ensureArrayLength, focusElement, range } from './utils/utils';

const notes = range(C3, C4);
type NoteDisplayMode = 'PianoRoll' | 'Tracker';

interface PatternEditorProps {
  patternMut: Pattern;
  patternLength: number;
  playPos: number;
  setPlayPos: Setter<number>;
  recordMode: boolean;
  stepsPerBeat: number;
  instrument: string;
}

export function PatternEditor(props: PatternEditorProps) {
  const baseNote = C3;
  const [noteDisplayMode, setNoteDisplayMode] = createSignal<NoteDisplayMode>('PianoRoll');

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Delete') {
      event.preventDefault();

      if (props.playPos >= 0 && props.playPos < props.patternLength) {
        const step = props.patternMut.steps[props.playPos];
        if (step) {
          step.note = undefined;
        }
      }
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (props.patternLength < 1) {
        return;
      }

      event.preventDefault();

      if (event.key === 'ArrowUp') {
        if (props.playPos < 0) {
          props.setPlayPos(0);
        } else {
          const nextPos = Math.min(props.patternLength - 1, Math.max(0, props.playPos - 1));
          if (nextPos !== props.playPos) {
            props.setPlayPos(nextPos);
          }
        }
        return;
      }

      if (event.key === 'ArrowDown') {
        if (props.playPos < 0) {
          props.setPlayPos(0);
        } else {
          const nextPos = Math.min(props.patternLength - 1, props.playPos + 1);
          if (nextPos !== props.playPos) {
            props.setPlayPos(nextPos);
          }
        }
        return;
      }
    }

    const inputNote = NOTE_BY_KEY_CODE[event.code];
    if (inputNote !== undefined) {
      const note = baseNote + inputNote;
      console.log('playNote', event.code, inputNote, getMidiNoteName(note));
      playNote(props.instrument, note);

      if (props.recordMode && props.playPos >= 0 && props.playPos < props.patternLength) {
        ensureArrayLength(props.patternMut.steps, props.playPos + 1, {});
        props.patternMut.steps[props.playPos].note = note;
      }
    }
  }

  return (
    <div ref={focusElement} class={cssClasses.patternEditor} tabIndex={0} onKeyDown={onKeyDown}>
      <div class={cssClasses.noteDisplayToggle}>
        <label>
          Display
          <select
            value={noteDisplayMode()}
            onChange={(event) => setNoteDisplayMode(event.currentTarget.value as NoteDisplayMode)}
          >
            <option value="PianoRoll">PianoRoll</option>
            <option value="Tracker">Tracker</option>
          </select>
        </label>
      </div>
      <table>
        <tbody>
          <Index each={range(0, props.patternLength - 1)}>
            {(_step, i) => (
              <NoteRow
                pos={i}
                notes={notes}
                step={props.patternMut.steps[i] ?? {}}
                isPlayPos={i === props.playPos}
                stepsPerBeat={props.stepsPerBeat}
                displayMode={noteDisplayMode}
                setNote={(note) => {
                  if (note) {
                    playNote(props.instrument, note);
                  }

                  ensureArrayLength(props.patternMut.steps, i + 1, {});
                  props.patternMut.steps[i].note = note;
                }}
              />
            )}
          </Index>
        </tbody>
      </table>
    </div>
  );
}

interface NoteRowProps {
  pos: number;
  notes: Note[];
  step: PatternStep;
  setNote: (note: Note | undefined) => void;
  isPlayPos: boolean;
  stepsPerBeat: number;
  displayMode: Accessor<NoteDisplayMode>;
}

function NoteRow(props: NoteRowProps) {
  return (
    <tr classList={{ [cssClasses.playPos]: props.isPlayPos }}>
      <td
        classList={{
          [cssClasses.beatStep]: props.pos % props.stepsPerBeat === 0,
        }}
      >
        {props.pos}
      </td>
      <Show when={props.displayMode() === 'Tracker'}>
        {props.step.note ? formatTrackerNote(props.step.note) : '---'}
      </Show>
      <Show when={props.displayMode() === 'PianoRoll'}>
        <Index each={props.notes}>
          {(note) => {
            const noteValue = note();
            const label = props.displayMode() === 'Tracker' ? formatTrackerNote(noteValue) : String(noteValue);
            return (
              <td
                classList={{ [cssClasses.noteCell]: true, [cssClasses.noteSelected]: props.step.note === noteValue }}
                onClick={() => props.setNote(props.step.note !== noteValue ? noteValue : undefined)}
              >
                {noteValue}
              </td>
            );
          }}
        </Index>
      </Show>
    </tr>
  );
}

function formatTrackerNote(note: Note): string {
  const trackerNoteNames = ['C-', 'C#', 'D-', 'D#', 'E-', 'F-', 'F#', 'G-', 'G#', 'A-', 'A#', 'B-'] as const;
  const octave = Math.floor(note / 12) - 1;
  const noteIndex = note % 12;
  return `${trackerNoteNames[noteIndex]}${octave}`;
}

const NOTE_BY_KEY_CODE: Partial<Record<string, Note>> = {
  // Lower row
  KeyZ: C_1,
  KeyS: Cis_1,
  KeyX: D_1,
  KeyD: Dis_1,
  KeyC: E_1,
  KeyV: F_1,
  KeyG: Fis_1,
  KeyB: G_1,
  KeyH: Gis_1,
  KeyN: A_1,
  KeyJ: B_1,
  KeyM: H_1,
  Comma: C0,
  KeyL: Cis0,
  Period: D0,
  Semicolon: Dis0,
  Slash: E0,
  // Upper Row
  KeyQ: C0,
  Digit2: Cis0,
  KeyW: D0,
  Digit3: Dis0,
  KeyE: E0,
  KeyR: F0,
  Digit5: Fis0,
  KeyT: G0,
  Digit6: Gis0,
  KeyY: A0,
  Digit7: B0,
  KeyU: H0,
  KeyI: C1,
  Digit9: Cis1,
  KeyO: D1,
  Digit0: Dis1,
  KeyP: E1,
  BracketLeft: F1,
  Equal: Fis1,
  BracketRight: G1,
};
