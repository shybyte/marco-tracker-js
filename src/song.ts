export interface Song {
  pattern: Pattern[];
}

export interface Pattern {
  steps: PatternStep[];
}

export type Note = number;

export interface PatternStep {
  note?: Note;
}
