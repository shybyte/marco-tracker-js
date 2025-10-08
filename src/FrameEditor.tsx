import { Index, Setter, Show } from 'solid-js';
import { PatternEditor } from './PatternEditor';
import type { Pattern, PatternID, Song } from './song';
import styles from './FrameEditor.module.css';

interface FrameEditorProps {
  frame: Song['frames'][number];
  patterns: Song['patterns'];
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
  return (
    <div class={styles.frameEditor}>
      <Index each={props.frame.channels}>
        {(patternIdAccessor, channelIndex) => {
          const resolvedPattern = () => resolvePattern(props.patterns, patternIdAccessor());

          return (
            <div class={styles.channelColumn}>
              <div class={styles.channelHeader}>Channel {channelIndex + 1}</div>
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
                  />
                )}
              </Show>
            </div>
          );
        }}
      </Index>
    </div>
  );
}
