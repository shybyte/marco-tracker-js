import { For } from 'solid-js';
import type { Song } from './song';
import styles from './PatternMatrix.module.css';

interface PatternMatrixProps {
  frames: Song['frames'];
  patterns: Song['patterns'];
  selectedFrame: number;
  onSelectFrame: (index: number) => void;
  onAssignChannel: (frameIndex: number, channelIndex: number, patternId: number | null) => void;
}

export function PatternMatrix(props: PatternMatrixProps) {
  const maxChannels = () => props.frames.reduce((max, frame) => Math.max(max, frame.channels.length), 0);

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
                    const patternId = () => frame.channels[channelIndex()] ?? null;
                    return (
                      <td>
                        <select
                          class={styles.patternSelect}
                          value={patternId() === null ? '' : String(patternId())}
                          onClick={(event) => event.stopPropagation()}
                          onMouseDown={(event) => event.stopPropagation()}
                          onChange={(event) => {
                            const value = event.currentTarget.value;
                            const nextPatternId = value === '' ? null : Number(value);
                            props.onAssignChannel(index(), channelIndex(), nextPatternId);
                          }}
                        >
                          <option value="">--</option>
                          <For each={props.patterns}>
                            {(pattern) => <option value={String(pattern.id)}>{pattern.id}</option>}
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
