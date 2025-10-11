import { Show, createEffect, createMemo, createSignal, onCleanup } from 'solid-js';
import styles from './ChannelConfigDialog.module.css';
import { createDefaultChannelNotes, type Note } from '../song';

export interface ChannelConfigDialogProps {
  open: boolean;
  channelName: string;
  initialNotes?: readonly Note[];
  onCancel: () => void;
  onSave: (notes: Note[] | undefined) => void;
}

const NOTE_NAME_MAPPINGS: readonly (readonly [number, readonly string[]])[] = [
  [0, ['c', 'b#']],
  [1, ['c#', 'cis', 'db', 'des']],
  [2, ['d']],
  [3, ['d#', 'dis', 'eb', 'ees']],
  [4, ['e', 'fb', 'fes']],
  [5, ['f', 'e#']],
  [6, ['f#', 'fis', 'gb', 'ges']],
  [7, ['g']],
  [8, ['g#', 'gis', 'ab', 'aes']],
  [9, ['a']],
  [10, ['a#', 'ais', 'bb', 'bes']],
  [11, ['b', 'h', 'cb', 'ces']],
];

const NOTE_SYMBOL_TO_INDEX = buildNoteSymbolIndex();
const ENGLISH_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const DEFAULT_CHANNEL_NOTES = createDefaultChannelNotes();
const DEFAULT_NOTES_PREVIEW = formatNotesList(DEFAULT_CHANNEL_NOTES);
const DEFAULT_NOTES_COUNT = DEFAULT_CHANNEL_NOTES.length;

export function ChannelConfigDialog(props: ChannelConfigDialogProps) {
  let dialogRef: HTMLDialogElement | undefined;
  const [inputValue, setInputValue] = createSignal('');
  const [parseError, setParseError] = createSignal<string | null>(null);
  const [previewNotes, setPreviewNotes] = createSignal<Note[]>([]);

  const previewText = createMemo(() => {
    if (inputValue().trim() === '') {
      return `Default: ${DEFAULT_NOTES_PREVIEW}`;
    }
    const notes = previewNotes();
    if (notes.length === 0) {
      return 'No valid notes yet.';
    }
    return formatNotesList(notes);
  });

  const previewCount = createMemo(() => {
    if (inputValue().trim() === '') {
      return DEFAULT_NOTES_COUNT;
    }
    return previewNotes().length;
  });

  const handleDialogClose = () => {
    props.onCancel();
  };

  onCleanup(() => {
    dialogRef?.removeEventListener('close', handleDialogClose);
  });

  createEffect(() => {
    if (!dialogRef) {
      return;
    }

    if (props.open) {
      if (!dialogRef.open) {
        dialogRef.showModal();
      }
    } else if (dialogRef.open) {
      dialogRef.close();
    }
  });

  createEffect(() => {
    if (!props.open) {
      return;
    }

    const initialNotes = props.initialNotes ?? [];
    setInputValue(initialNotes.length > 0 ? formatNotesList(initialNotes) : '');
    setParseError(null);
    setPreviewNotes(initialNotes.slice());
  });

  function assignDialogRef(element: HTMLDialogElement) {
    if (dialogRef) {
      dialogRef.removeEventListener('close', handleDialogClose);
    }
    dialogRef = element;
    dialogRef.addEventListener('close', handleDialogClose);
  }

  function handleInputValueChange(value: string) {
    setInputValue(value);

    if (value.trim() === '') {
      setParseError(null);
      setPreviewNotes([]);
      return;
    }

    const parseResult = parseNotesInput(value);
    if (!parseResult.ok) {
      setParseError(parseResult.error);
      setPreviewNotes(parseResult.partialNotes);
      return;
    }

    setParseError(null);
    setPreviewNotes(parseResult.notes);
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const trimmed = inputValue().trim();

    if (trimmed === '') {
      props.onSave(undefined);
      dialogRef?.close();
      return;
    }

    const parseResult = parseNotesInput(trimmed);

    if (!parseResult.ok) {
      setParseError(parseResult.error);
      return;
    }

    props.onSave(parseResult.notes.length > 0 ? parseResult.notes : undefined);
    dialogRef?.close();
  }

  return (
    <dialog ref={assignDialogRef} class={styles.channelDialog}>
      <form method="dialog" class={styles.channelDialogForm} onSubmit={handleSubmit}>
        <header class={styles.channelDialogHeader}>
          <h2>{props.channelName}</h2>
        </header>
        <p class={styles.channelDialogHint}>
          Enter note names (for example `C3`, `C#3`, `Eb4`) or MIDI note numbers separated by spaces or commas. Leave the
          field empty to use the default channel note range.
        </p>
        <textarea
          class={styles.channelDialogTextarea}
          rows={4}
          value={inputValue()}
          onInput={(event) => handleInputValueChange(event.currentTarget.value)}
          placeholder="Example: C3, D3, E3, F3, G3, A3, B3"
        />
        <Show when={parseError()}>
          {(errorAccessor) => <div class={styles.channelDialogError}>{errorAccessor()}</div>}
        </Show>
        <div class={styles.channelDialogPreview}>
          <span class={styles.channelDialogPreviewLabel}>Allowed notes ({previewCount()})</span>
          <span class={styles.channelDialogPreviewValue}>{previewText()}</span>
        </div>
        <footer class={styles.channelDialogActions}>
          <button type="button" onClick={() => dialogRef?.close()}>
            Cancel
          </button>
          <button type="submit">Save</button>
        </footer>
      </form>
    </dialog>
  );
}

interface NotesParseSuccess {
  ok: true;
  notes: Note[];
}

interface NotesParseFailure {
  ok: false;
  error: string;
  partialNotes: Note[];
}

type NotesParseResult = NotesParseSuccess | NotesParseFailure;

function buildNoteSymbolIndex(): Map<string, number> {
  const symbolToIndex = new Map<string, number>();
  for (const [index, aliases] of NOTE_NAME_MAPPINGS) {
    for (const alias of aliases) {
      symbolToIndex.set(alias.toLowerCase(), index);
    }
  }
  return symbolToIndex;
}

function formatNoteName(note: Note): string {
  const semitone = note % 12;
  const octave = Math.floor(note / 12) - 1;
  const noteName = ENGLISH_NOTE_NAMES[semitone];
  return `${noteName}${octave}`;
}

function formatNotesList(notes: readonly Note[]): string {
  return notes
    .slice()
    .sort((left, right) => left - right)
    .map((note) => formatNoteName(note))
    .join(', ');
}

function parseNotesInput(input: string): NotesParseResult {
  const tokens = input
    .split(/[\s,;]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  const parsedNotes: Note[] = [];

  for (const token of tokens) {
    const note = parseNoteToken(token);
    if (note === null) {
      const uniqueNotes = deduplicateAndSort(parsedNotes);
      return { ok: false, error: `Could not interpret token "${token}".`, partialNotes: uniqueNotes };
    }
    parsedNotes.push(note);
  }

  const uniqueNotes = deduplicateAndSort(parsedNotes);
  return { ok: true, notes: uniqueNotes };
}

function parseNoteToken(token: string): Note | null {
  if (/^\d{1,3}$/.test(token)) {
    const value = Number(token);
    if (value >= 0 && value <= 127) {
      return value;
    }
    return null;
  }

  const match = token.match(/^([A-Za-z#♯♭]+)(-?\d+)$/);
  if (!match) {
    return null;
  }

  let symbol = match[1].toLowerCase();
  const octave = Number(match[2]);

  if (!Number.isInteger(octave)) {
    return null;
  }

  symbol = symbol.replace(/♯/g, '#').replace(/♭/g, 'b');
  symbol = symbol.replace(/is/g, '#').replace(/es/g, 'b');

  const semitone = NOTE_SYMBOL_TO_INDEX.get(symbol);
  if (semitone === undefined) {
    return null;
  }

  const noteValue = semitone + (octave + 1) * 12;
  if (noteValue < 0 || noteValue > 127) {
    return null;
  }

  return noteValue;
}

function deduplicateAndSort(notes: Note[]): Note[] {
  return Array.from(new Set(notes)).sort((left, right) => left - right);
}
