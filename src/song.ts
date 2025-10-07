import { times } from './utils/utils';

type PatternID = number;

export interface Song {
  tempo: number;
  stepsPerBeat: number;
  patternLength: number;
  patterns: Pattern[];
  frames: Frame[];
  instruments: string[];
}

interface Frame {
  channels: Array<PatternID | null>;
}

export interface Pattern {
  id: PatternID;
  steps: PatternStep[];
}

export type Note = number;

export interface PatternStep {
  notes: Note[];
}

export function createEmptyPatternStep(): PatternStep {
  return { notes: [] };
}

export function createEmptySong(): Song {
  const patternLength = 16;
  const emptyPattern1 = createEmptyPattern(0, patternLength);
  const emptyPattern2 = createEmptyPattern(1, patternLength);
  return {
    tempo: 120,
    stepsPerBeat: 4,
    patternLength: patternLength,
    instruments: ['marimba'],
    frames: [
      { channels: [emptyPattern1.id, null] }, //
      { channels: [emptyPattern1.id, emptyPattern2.id] },
      { channels: [null, emptyPattern2.id] },
    ],
    patterns: [emptyPattern1, emptyPattern2],
  };
}

function createEmptyPattern(id: number, length: number): Pattern {
  return { id, steps: times(length, () => createEmptyPatternStep()) };
}
