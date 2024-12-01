import { Soundfont } from 'smplr';
import { For } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import cssClasses from './PatternEditor.module.css';
import { C3, C4 } from './notes';
import { Note, Pattern, PatternStep } from './song';
import { range, times } from './utils';
import { playNote } from './instruments';

function createEmptyPattern(length: number): Pattern {
  return { steps: times(length, () => ({ note: undefined })) };
}

const notes = range(C3, C4);

export function PatternEditor() {
  const [pattern, setPattern] = createStore<Pattern>(createEmptyPattern(16));

  return (
    <div class={cssClasses.patternEditor}>
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
