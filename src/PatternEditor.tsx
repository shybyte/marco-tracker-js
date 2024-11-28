import { createStore, produce } from 'solid-js/store';
import cssClasses from './PatternEditor.module.css';
import { Note, Pattern, PatternStep } from './song';
import { For } from 'solid-js';
import { C3, C4 } from './notes';
import { range, times } from './utils';

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
                setNote={(note) =>
                  setPattern(
                    produce((pattern) => {
                      pattern.steps[i()].note = note;
                    }),
                  )
                }
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
  setNote: (note: Note) => void;
}

function NoteRow(props: NoteRowProps) {
  console.log(props);
  return (
    <tr>
      <td>{props.pos}</td>
      <For each={props.notes}>
        {(note) => (
          <td
            // class={cssClasses.noteCell}
            classList={{ [cssClasses.noteCell]: true, [cssClasses.noteSelected]: props.step.note === note }}
            onClick={() => props.setNote(note)}
          >
            {note}
          </td>
        )}
      </For>
    </tr>
  );
}
