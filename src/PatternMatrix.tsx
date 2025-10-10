import { For } from 'solid-js';
import type { Song } from './song';
import styles from './PatternMatrix.module.css';
import { maxBy } from './utils/utils';
import { ContextMenu, createContextMenuController } from './components/ContextMenu';

interface PatternMatrixProps {
  frames: Song['frames'];
  channels: Song['channels'];
  selectedFrame: number;
  onSelectFrame: (index: number) => void;
  onAssignChannel: (frameIndex: number, channelIndex: number, patternId: string | null) => void;
  onCreatePattern: (channelIndex: number) => string;
  onInsertFrame: (insertIndex: number) => void;
}

const NEW_PATTERN_VALUE = '__new_pattern__';

export function PatternMatrix(props: PatternMatrixProps) {
  const maxChannels = () =>
    Math.max(
      props.channels.length,
      maxBy(props.frames, (frame) => frame.channels.length)
    );

  const contextMenu = createContextMenuController<number | null>();

  const handleAddRow = () => {
    const targetIndex = contextMenu.data();
    const insertIndex = targetIndex == null ? props.frames.length : targetIndex + 1;
    contextMenu.close();
    props.onInsertFrame(insertIndex);
  };

  return (
    <div class={styles.patternMatrix} onContextMenu={(event) => contextMenu.open(event, null)}>
      <table class={styles.table}>
        <thead>
          <tr>
            <th class={styles.headerCell}>Frame</th>
            <For each={Array.from({ length: maxChannels() })}>
              {(_, index) => <th class={styles.headerCell}>Ch {index() + 1}</th>}
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
                onContextMenu={(event) => contextMenu.open(event, index())}
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
        <button type="button" onClick={handleAddRow} role="menuitem">
          Add Row Below
        </button>
      </ContextMenu>
    </div>
  );
}
