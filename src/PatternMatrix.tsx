import { For } from 'solid-js';
import type { Song } from './song';
import styles from './PatternMatrix.module.css';
import { maxBy } from './utils/utils';
import { ContextMenu, ContextMenuItem, createContextMenuController } from './components/ContextMenu';

interface PatternMatrixProps {
  frames: Song['frames'];
  channels: Song['channels'];
  selectedFrame: number;
  onSelectFrame: (index: number) => void;
  onAssignChannel: (frameIndex: number, channelIndex: number, patternId: string | null) => void;
  onCreatePattern: (channelIndex: number) => string;
  onInsertFrame: (insertIndex: number) => void;
  onDeleteFrame: (frameIndex: number) => void;
  onAddChannel: () => void;
  onRemoveChannel: (channelIndex: number) => void;
}

const NEW_PATTERN_VALUE = '__new_pattern__';

export function PatternMatrix(props: PatternMatrixProps) {
  const maxChannels = () =>
    Math.max(
      props.channels.length,
      maxBy(props.frames, (frame) => frame.channels.length)
    );

  type ContextMenuPayload = { type: 'matrix' } | { type: 'frame'; index: number } | { type: 'channel'; index: number };

  const contextMenu = createContextMenuController<ContextMenuPayload>();

  function handleRemoveChannel(channelIndex: number) {
    const confirmed = window.confirm(`Remove channel ${channelIndex}? This will delete it from all frames.`);
    if (confirmed) {
      props.onRemoveChannel(channelIndex);
    }
  }

  return (
    <div class={styles.patternMatrix} onContextMenu={(event) => contextMenu.open(event, { type: 'matrix' })}>
      <table class={styles.table}>
        <thead>
          <tr>
            <th class={styles.headerCell}>Frame</th>
            <For each={Array.from({ length: maxChannels() })}>
              {(_, index) => (
                <th
                  class={styles.headerCell}
                  onContextMenu={(event) => contextMenu.open(event, { type: 'channel', index: index() })}
                >
                  Ch {index() + 1}
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={props.frames}>
            {(frame, index) => (
              <tr
                classList={{
                  [styles.selectedRow]: index() === props.selectedFrame,
                }}
                onClick={() => props.onSelectFrame(index())}
                onContextMenu={(event) => contextMenu.open(event, { type: 'frame', index: index() })}
              >
                <td>{index() + 1}</td>
                <For each={Array.from({ length: maxChannels() })}>
                  {(_, channelIndex) => {
                    return (
                      <td>
                        <select
                          class={styles.patternSelect}
                          value={frame.channels[channelIndex()] || ''}
                          onClick={(event) => event.stopPropagation()}
                          onMouseDown={(event) => event.stopPropagation()}
                          onChange={(event) => {
                            const value = event.currentTarget.value;
                            if (value === NEW_PATTERN_VALUE) {
                              const createdPatternId = props.onCreatePattern(channelIndex());
                              props.onAssignChannel(index(), channelIndex(), createdPatternId);
                              event.currentTarget.value = createdPatternId;
                              return;
                            } else {
                              const nextPatternId = value || null;
                              props.onAssignChannel(index(), channelIndex(), nextPatternId);
                            }
                          }}
                        >
                          <option value="">--</option>
                          <option value={NEW_PATTERN_VALUE}>New Pattern</option>
                          <For each={props.channels[channelIndex()]?.patterns ?? []}>
                            {(pattern) => <option value={pattern.id}>{pattern.id}</option>}
                          </For>
                        </select>
                      </td>
                    );
                  }}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
      <ContextMenu anchor={contextMenu.anchor} onClose={contextMenu.close}>
        {() => {
          const payload = contextMenu.data();
          if (!payload) {
            return <></>;
          }

          return (
            <>
              <ContextMenuItem onClick={props.onAddChannel}>Add Channel</ContextMenuItem>

              <ContextMenuItem
                onClick={() => props.onInsertFrame(payload.type === 'frame' ? payload.index + 1 : props.frames.length)}
              >
                Add Row Below
              </ContextMenuItem>

              {payload.type === 'frame' && (
                <ContextMenuItem onClick={() => props.onDeleteFrame(payload.index)}>Delete Row</ContextMenuItem>
              )}

              {payload.type === 'channel' && (
                <ContextMenuItem onClick={() => handleRemoveChannel(payload.index)}>Remove Channel</ContextMenuItem>
              )}
            </>
          );
        }}
      </ContextMenu>
    </div>
  );
}
