import { type Accessor, Index, type Setter, Show } from 'solid-js';
import { playNote } from './instruments';
import type { MidiCannel } from './midi-output';
import {
  A_1,
  A0,
  B_1,
  B0,
  C_1,
  C0,
  C1,
  C3,
  Cis_1,
  Cis0,
  Cis1,
  D_1,
  D0,
  D1,
  Dis_1,
  Dis0,
  Dis1,
  E_1,
  E0,
  E1,
  F_1,
  F0,
  F1,
  Fis_1,
  Fis0,
  Fis1,
  G_1,
  G0,
  G1,
  Gis_1,
  Gis0,
  getMidiNoteName,
  H_1,
  H0,
} from './notes';
import cssClasses from './PatternEditor.module.css';
import { createEmptyPatternStep, type ChannelMode, type Note, type Pattern, type PatternStep } from './song';
import { ensureArrayLength, focusElement, range } from './utils/utils';

interface PatternEditorProps {
  patternMut: Pattern;
  patternLength: number;
  playPos: number;
  setPlayPos: Setter<number>;
  recordMode: boolean;
  stepsPerBeat: number;
  channel: MidiCannel;
  allowedNotes: readonly Note[];
  displayMode: ChannelMode;
}

export function PatternEditor(props: PatternEditorProps) {
  const baseNote = C3;
  const noteDisplayMode = () => props.displayMode;

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Delete') {
      event.preventDefault();

      if (props.playPos >= 0 && props.playPos < props.patternLength) {
        const step = props.patternMut.steps[props.playPos];
        if (step) {
          step.notes = [];
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
      playNote(props.channel, note);

      if (props.recordMode && props.playPos >= 0 && props.playPos < props.patternLength) {
        ensureArrayLength(props.patternMut.steps, props.playPos + 1, createEmptyPatternStep());
        const step = props.patternMut.steps[props.playPos];
        if (!step.notes.includes(note)) {
          step.notes.push(note);
        }
      }
    }
  }

  return (
    <div ref={focusElement} class={cssClasses.patternEditor} tabIndex={0} onKeyDown={onKeyDown}>
      <table>
        <tbody>
          <Index each={range(0, props.patternLength - 1)}>
            {(_step, i) => (
              <NoteRow
                pos={i}
                allowedNotes={props.allowedNotes}
                step={props.patternMut.steps[i] ?? createEmptyPatternStep()}
                isPlayPos={i === props.playPos}
                stepsPerBeat={props.stepsPerBeat}
                displayMode={noteDisplayMode}
                toggleNote={(note) => {
                  const step = props.patternMut.steps[i];
                  const exists = step?.notes.includes(note);

                  if (!exists) {
                    playNote(props.channel, note);
                  }

                  ensureArrayLength(props.patternMut.steps, i + 1, createEmptyPatternStep());
                  const targetStep = props.patternMut.steps[i];
                  if (!Array.isArray(targetStep.notes)) {
                    targetStep.notes = [];
                  }
                  const noteIndex = targetStep.notes.indexOf(note);

                  if (noteIndex === -1) {
                    targetStep.notes.push(note);
                  } else {
                    targetStep.notes.splice(noteIndex, 1);
                  }
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
  allowedNotes: readonly Note[];
  step: PatternStep;
  toggleNote: (note: Note) => void;
  isPlayPos: boolean;
  stepsPerBeat: number;
  displayMode: Accessor<ChannelMode>;
}

function NoteRow(props: NoteRowProps) {
  return (
    <tr
      classList={{
        [cssClasses.playPos]: props.isPlayPos,
        [cssClasses.beatRow]: props.pos % props.stepsPerBeat === 0,
      }}
    >
      <Show when={props.displayMode() === 'tracker'}>
        <td class={cssClasses.trackerCell} colSpan={props.allowedNotes.length}>
          {props.step.notes.length > 0 ? formatTrackerNotes(props.step.notes) : '---'}
        </td>
      </Show>
      <Show when={props.displayMode() === 'pianoRoll'}>
        <Index each={props.allowedNotes}>
          {(note) => {
            const noteValue = note();
            return (
              <td
                classList={{
                  [cssClasses.noteCell]: true,
                  [cssClasses.noteSelected]: props.step.notes.includes(noteValue),
                }}
                onClick={() => props.toggleNote(noteValue)}
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

function formatTrackerNotes(notes: Note[]): string {
  return notes.map((note) => formatTrackerNote(note)).join(' ');
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
