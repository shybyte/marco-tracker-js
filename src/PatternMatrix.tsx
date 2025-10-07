import { For } from 'solid-js';
import type { Song } from './song';
import styles from './PatternMatrix.module.css';

interface PatternMatrixProps {
  frames: Song['frames'];
  selectedFrame: number;
  onSelectFrame: (index: number) => void;
}

export function PatternMatrix(props: PatternMatrixProps) {
  const maxChannels = () =>
    props.frames.reduce((max, frame) => Math.max(max, frame.channels.length), 0);

  return (
    <div class={styles.patternMatrix}>
      <table class={styles.table}>
        <thead>
          <tr>
            <th class={styles.headerCell}>Frame</th>
            <For each={Array.from({ length: maxChannels() })}>
              {(_, index) => (
                <th class={styles.headerCell}>Ch {index() + 1}</th>
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
              >
                <td>{index() + 1}</td>
                <For each={Array.from({ length: maxChannels() })}>
                  {(_, channelIndex) => {
                    const patternId = frame.channels[channelIndex()];
                    const hasPattern = patternId !== null && patternId !== undefined;
                    return <td>{hasPattern ? patternId : <span class={styles.emptyCell}>-</span>}</td>;
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
