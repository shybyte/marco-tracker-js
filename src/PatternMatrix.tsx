import { For } from 'solid-js';
import type { Song } from './song';
import styles from './PatternMatrix.module.css';
import { maxBy } from './utils/utils';

interface PatternMatrixProps {
  frames: Song['frames'];
  patterns: Song['patterns'];
  selectedFrame: number;
  onSelectFrame: (index: number) => void;
  onAssignChannel: (frameIndex: number, channelIndex: number, patternId: string | null) => void;
}

export function PatternMatrix(props: PatternMatrixProps) {
  const maxChannels = () => maxBy(props.frames, (frame) => frame.channels.length);

  return (
    <div class={styles.patternMatrix}>
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
                            const nextPatternId = value || null;
                            props.onAssignChannel(index(), channelIndex(), nextPatternId);
                          }}
                        >
                          <option value="">--</option>
                          <For each={props.patterns}>
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
    </div>
  );
}
