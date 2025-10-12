import { createSignal, For, Index, type Setter, Show } from 'solid-js';
import { ChannelConfigDialog } from './components/ChannelConfigDialog';
import { ContextMenu, ContextMenuItem, createContextMenuController } from './components/ContextMenu';
import styles from './FrameEditor.module.css';
import { PatternEditor } from './PatternEditor';
import { createDefaultChannelNotes, type Note, type Pattern, type PatternID, type Song } from './song';
import { range } from './utils/utils';

interface ChannelDialogState {
  channelIndex: number;
}

interface FrameEditorProps {
  frame: Song['frames'][number];
  channels: Song['channels'];
  patternLength: number;
  playPos: number;
  setPlayPos: Setter<number>;
  recordMode: boolean;
  stepsPerBeat: number;
}

function resolvePattern(patterns: Pattern[], patternId: PatternID | null | undefined): Pattern | undefined {
  if (patternId === null || patternId === undefined) {
    return undefined;
  }
  return patterns.find((pattern) => pattern.id === patternId);
}

export function FrameEditor(props: FrameEditorProps) {
  const rowIndices = () => (props.patternLength > 0 ? range(0, props.patternLength - 1) : []);
  const fallbackNotes = createDefaultChannelNotes();
  const channelContextMenu = createContextMenuController<{ channelIndex: number }>();
  const [channelDialogState, setChannelDialogState] = createSignal<ChannelDialogState | null>(null);

  function handleSaveChannelNotes(channelIndex: number, notes: Note[] | undefined) {
    const channel = props.channels[channelIndex];
    channel.notes = notes;
  }

  return (
    <div class={styles.frameEditor}>
      <div class={styles.rowIndexColumn}>
        <div class={styles.rowIndexHeader}>Pos</div>
        <For each={rowIndices()}>
          {(pos) => (
            <div
              classList={{
                [styles.rowIndex]: true,
                [styles.playPos]: pos === props.playPos,
                [styles.beatStep]: pos % props.stepsPerBeat === 0,
              }}
            >
              {pos}
            </div>
          )}
        </For>
      </div>
      <Index each={props.frame.channels}>
        {(patternIdAccessor, channelIndex) => {
          const resolvedPattern = () => {
            const channel = props.channels[channelIndex];
            if (!channel) {
              return undefined; // This can happen while deleting a column
            }
            return resolvePattern(channel.patterns, patternIdAccessor());
          };

          return (
            <div class={styles.channelColumn}>
              <div
                class={styles.channelHeader}
                onContextMenu={(event) => channelContextMenu.open(event, { channelIndex })}
              >
                Channel {channelIndex + 1}
              </div>
              <Show when={resolvedPattern()} fallback={<div class={styles.channelPlaceholder}>No pattern</div>}>
                {(patternMut) => (
                  <PatternEditor
                    patternMut={patternMut()}
                    patternLength={props.patternLength}
                    playPos={props.playPos}
                    setPlayPos={props.setPlayPos}
                    recordMode={props.recordMode}
                    stepsPerBeat={props.stepsPerBeat}
                    channel={channelIndex}
                    allowedNotes={props.channels[channelIndex]?.notes ?? fallbackNotes}
                    displayMode={props.channels[channelIndex]?.mode ?? 'pianoRoll'}
                    onDisplayModeChange={(mode) => {
                      const channel = props.channels[channelIndex];
                      if (channel) {
                        channel.mode = mode;
                      }
                    }}
                  />
                )}
              </Show>
            </div>
          );
        }}
      </Index>

      <ContextMenu
        payload={channelContextMenu.data()}
        anchor={channelContextMenu.anchor}
        onClose={channelContextMenu.close}
      >
        {(payload) => (
          <ContextMenuItem onClick={() => setChannelDialogState({ channelIndex: payload.channelIndex })}>
            Configure Channel
          </ContextMenuItem>
        )}
      </ContextMenu>

      <Show when={channelDialogState()}>
        {(state) => (
          <ChannelConfigDialog
            open={true}
            channelName={`Channel ${state().channelIndex + 1}`}
            initialNotes={props.channels[state().channelIndex]?.notes}
            onCancel={() => setChannelDialogState(null)}
            onSave={(notes) => {
              setChannelDialogState(null);
              handleSaveChannelNotes(state().channelIndex, notes);
            }}
          />
        )}
      </Show>
    </div>
  );
}
