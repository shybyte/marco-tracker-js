import { For } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
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
import { focusElement, range, times } from './utils';

function createEmptyPattern(length: number): Pattern {
  return { steps: times(length, () => ({ note: undefined })) };
}

const notes = range(C3, C4);

export function PatternEditor() {
  const baseNote = C3;
  const [pattern, setPattern] = createStore<Pattern>(createEmptyPattern(16));

  function onKeyDown(event: KeyboardEvent) {
    const inputNote = NOTE_BY_KEY_CODE[event.code];
    if (inputNote !== undefined) {
      const note = baseNote + inputNote;
      console.log('playNote', event.code, inputNote, getMidiNoteName(note));
      playNote(note);
    }
  }

  return (
    <div ref={focusElement} class={cssClasses.patternEditor} tabIndex={0} onKeyDown={onKeyDown}>
      <table>
        <tbody>
          <For each={pattern.steps}>
            {(step, i) => (
              <NoteRow
                pos={i()}
                notes={notes}
                step={step}
                setNote={(note) => {
                  if (note) {
                    playNote(note);
                  }
                  return setPattern(
                    produce((pattern) => {
                      pattern.steps[i()].note = note;
                    }),
                  );
                }}
              />
            )}
          </For>
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
}

function NoteRow(props: NoteRowProps) {
  return (
    <tr>
      <td>{props.pos}</td>
      <For each={props.notes}>
        {(note) => (
          <td
            // class={cssClasses.noteCell}
            classList={{ [cssClasses.noteCell]: true, [cssClasses.noteSelected]: props.step.note === note }}
            onClick={() => props.setNote(props.step.note !== note ? note : undefined)}
          >
            {note}
          </td>
        )}
      </For>
    </tr>
  );
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
