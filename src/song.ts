import { maxBy, times } from './utils/utils';

export type PatternID = string; // unique relative to the channel

export interface Song {
  tempo: number;
  stepsPerBeat: number;
  patternLength: number;
  channels: Channel[];
  frames: Frame[];
}

export interface Channel {
  patterns: Pattern[];
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
  const channel0Pattern = createEmptyPattern('0', patternLength);
  const channel1Pattern = createEmptyPattern('0', patternLength);
  return {
    tempo: 120,
    stepsPerBeat: 4,
    patternLength: patternLength,
    channels: [{ patterns: [channel0Pattern] }, { patterns: [channel1Pattern] }],
    frames: [
      { channels: [channel0Pattern.id, null] }, //
      { channels: [channel0Pattern.id, channel1Pattern.id] },
      { channels: [null, channel1Pattern.id] },
    ],
  };
}

function createEmptyPattern(id: PatternID, length: number): Pattern {
  return { id, steps: times(length, () => createEmptyPatternStep()) };
}

export function normalizeSong(song: Song): Song {
  if (!Array.isArray(song.channels)) {
    song.channels = [];
  }

  song.channels.forEach((channel) => {
    if (!Array.isArray(channel.patterns)) {
      channel.patterns = [];
    }

    channel.patterns.forEach((pattern, index) => {
      if (pattern.id === undefined || pattern.id === null) {
        pattern.id = String(index);
      }

      if (!Array.isArray(pattern.steps)) {
        pattern.steps = [];
      }
    });
  });

  if (!Array.isArray(song.frames)) {
    song.frames = [];
  }

  if (song.frames.length === 0 && song.channels.length > 0) {
    song.frames = [
      {
        channels: song.channels.map((channel) => channel.patterns[0]?.id ?? null),
      },
    ];
  }

  song.frames.forEach((frame) => {
    if (!Array.isArray(frame.channels)) {
      frame.channels = [];
    }

    frame.channels = frame.channels.map((patternId) => (patternId === undefined ? null : patternId));

    const hasAssignedChannel = frame.channels.some((patternId) => patternId !== null && patternId !== undefined);
    if (!hasAssignedChannel && song.channels.length > 0) {
      const channelCount = Math.max(frame.channels.length, song.channels.length);
      frame.channels = Array.from({ length: channelCount }, (_, channelIndex) => {
        const channel = song.channels[channelIndex];
        return channel?.patterns[0]?.id ?? null;
      });
    }
  });

  return song;
}

export function createPatternForChannel(song: Song, channelIndex: number): PatternID {
  const channel = song.channels[channelIndex];
  if (!channel) {
    throw new Error(`Channel ${channelIndex} does not exist.`);
  }

  const existingIds = new Set(channel.patterns.map((pattern) => pattern.id));
  let counter = channel.patterns.length;
  let candidateId = String(counter);

  while (existingIds.has(candidateId)) {
    counter += 1;
    candidateId = String(counter);
  }

  const pattern = createEmptyPattern(candidateId, song.patternLength);
  channel.patterns.push(pattern);

  return pattern.id;
}

export function insertFrame(song: Song, insertIndex: number): void {
  const frames = song.frames;
  const channelCount = Math.max(song.channels.length, maxBy(frames, (frame) => frame.channels.length));

  const templateFrame = frames[insertIndex - 1] ?? frames[insertIndex];

  const channels = Array.from({ length: channelCount }, (_, channelIndex) => {
    if (templateFrame) {
      return templateFrame.channels[channelIndex] ?? null;
    }
    const channel = song.channels[channelIndex];
    return channel?.patterns[0]?.id ?? null;
  });

  frames.splice(insertIndex, 0, { channels });
}
