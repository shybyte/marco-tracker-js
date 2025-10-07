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

export function normalizeSong(song: Song): Song {
  if (!Array.isArray(song.patterns)) {
    song.patterns = [];
  }

  song.patterns.forEach((pattern, index) => {
    if (pattern.id === undefined || pattern.id === null) {
      pattern.id = index;
    }

    if (!Array.isArray(pattern.steps)) {
      pattern.steps = [];
    }
  });

  if (!Array.isArray(song.frames)) {
    song.frames = [];
  }

  if (song.frames.length === 0 && song.patterns.length > 0) {
    song.frames = [{ channels: song.patterns.map((pattern) => pattern.id ?? null) }];
  }

  song.frames.forEach((frame) => {
    if (!Array.isArray(frame.channels)) {
      frame.channels = [];
    }

    frame.channels = frame.channels.map((patternId) => (patternId === undefined ? null : patternId));

    const hasAssignedChannel = frame.channels.some((patternId) => patternId !== null && patternId !== undefined);
    if (!hasAssignedChannel && song.patterns.length > 0) {
      const channelCount = Math.max(frame.channels.length, song.patterns.length, song.instruments.length);
      frame.channels = Array.from({ length: channelCount }, (_, index) => song.patterns[index]?.id ?? null);
    }
  });

  return song;
}
