import { createEffect, createMemo, createSignal, onCleanup, Show } from 'solid-js';
import { type ChannelMode, createDefaultChannelNotes, type Note } from '../song';
import styles from './ChannelConfigDialog.module.css';

export interface ChannelConfigDialogProps {
  open: boolean;
  dialogTitle: string;
  defaultName: string;
  initialName?: string;
  initialNotes?: readonly Note[];
  initialMode?: ChannelMode;
  onCancel: () => void;
  onSave: (config: ChannelConfigResult) => void;
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
const DEFAULT_CHANNEL_MODE: ChannelMode = 'pianoRoll';

interface ChannelConfigResult {
  name: string | undefined;
  notes: Note[] | undefined;
  mode: ChannelMode;
}

export function ChannelConfigDialog(props: ChannelConfigDialogProps) {
  let dialogRef: HTMLDialogElement;
  const [nameInputValue, setNameInputValue] = createSignal('');
  const [notesInputValue, setNotesInputValue] = createSignal('');
  const [parseError, setParseError] = createSignal<string | null>(null);
  const [previewNotes, setPreviewNotes] = createSignal<Note[]>([]);
  const [mode, setMode] = createSignal<ChannelMode>(DEFAULT_CHANNEL_MODE);

  const previewText = createMemo(() => {
    if (notesInputValue().trim() === '') {
      return `Default: ${DEFAULT_NOTES_PREVIEW}`;
    }
    const notes = previewNotes();
    if (notes.length === 0) {
      return 'No valid notes yet.';
    }
    return formatNotesList(notes);
  });

  const previewCount = createMemo(() => {
    if (notesInputValue().trim() === '') {
      return DEFAULT_NOTES_COUNT;
    }
    return previewNotes().length;
  });

  function handleDialogClose() {
    props.onCancel();
  }

  onCleanup(() => {
    dialogRef.removeEventListener('close', handleDialogClose);
  });

  createEffect(() => {
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

    setNameInputValue(props.initialName ?? '');
    setMode(props.initialMode ?? DEFAULT_CHANNEL_MODE);
    const initialNotes = props.initialNotes ?? [];
    setNotesInputValue(initialNotes.length > 0 ? formatNotesList(initialNotes) : '');
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
    setNotesInputValue(value);

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
    const normalizedName = normalizeChannelName(nameInputValue());
    const trimmedNotes = notesInputValue().trim();

    if (trimmedNotes === '') {
      props.onSave({ name: normalizedName, notes: undefined, mode: mode() });
      dialogRef.close();
      return;
    }

    const parseResult = parseNotesInput(trimmedNotes);

    if (!parseResult.ok) {
      setParseError(parseResult.error);
      return;
    }

    props.onSave({
      name: normalizedName,
      notes: parseResult.notes.length > 0 ? parseResult.notes : undefined,
      mode: mode(),
    });
    dialogRef.close();
  }

  return (
    <dialog ref={assignDialogRef} class={styles.channelDialog}>
      <form method="dialog" class={styles.channelDialogForm} onSubmit={handleSubmit}>
        <header class={styles.channelDialogHeader}>
          <h2>{props.dialogTitle}</h2>
        </header>
        <div class={styles.channelDialogName}>
          <label class={styles.channelDialogNameLabel} for="channel-config-name">
            Channel name (optional)
          </label>
          <input
            id="channel-config-name"
            class={styles.channelDialogNameInput}
            type="text"
            value={nameInputValue()}
            onInput={(event) => setNameInputValue(event.currentTarget.value)}
            placeholder={props.defaultName}
          />
        </div>
        <p class={styles.channelDialogHint}>
          Enter note names (for example `C3`, `C#3`, `Eb4`) or MIDI note numbers separated by spaces or commas. Leave
          the field empty to use the default channel note range.
        </p>
        <textarea
          class={styles.channelDialogTextarea}
          rows={4}
          value={notesInputValue()}
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
        <div class={styles.channelDialogMode}>
          <span class={styles.channelDialogModeLabel}>Display mode</span>
          <select
            class={styles.channelDialogModeSelect}
            value={mode()}
            onChange={(event) => setMode(event.currentTarget.value as ChannelMode)}
          >
            <option value="pianoRoll">Piano Roll</option>
            <option value="tracker">Tracker</option>
          </select>
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

function normalizeChannelName(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
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
