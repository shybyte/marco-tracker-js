import type { Note } from './song';

type NavigatorWithMidi = Navigator & {
  requestMIDIAccess?: (options?: unknown) => Promise<MIDIAccess>;
};

let midiInitPromise: Promise<void> | null = null;
let midiOutputs: MIDIOutput[] = [];

export type MidiOutputInfo = {
  id: string;
  name: string;
  manufacturer?: string;
};

type MidiOutputsListener = (outputs: MidiOutputInfo[]) => void;

let midiOutputInfos: MidiOutputInfo[] = [];
const midiOutputsListeners = new Set<MidiOutputsListener>();

let selectedMidiOutputId: string | null = null;

function notifyMidiOutputListeners() {
  const snapshot = midiOutputInfos.map((info) => ({ ...info }));
  midiOutputsListeners.forEach((listener) => listener(snapshot));
}

function updateMidiOutputs(access: MIDIAccess) {
  midiOutputs = Array.from(access.outputs.values());
  midiOutputInfos = midiOutputs.map((output) => ({
    id: output.id,
    name: output.name ?? `MIDI ${output.id}`,
    manufacturer: output.manufacturer ?? undefined,
  }));

  if (selectedMidiOutputId && !midiOutputs.some((output) => output.id === selectedMidiOutputId)) {
    selectedMidiOutputId = null;
  }

  notifyMidiOutputListeners();
}

function initMidi() {
  if (midiInitPromise) {
    return midiInitPromise;
  }

  if (typeof navigator === 'undefined') {
    midiInitPromise = Promise.resolve();
    return midiInitPromise;
  }

  const navigatorWithMidi = navigator as NavigatorWithMidi;

  if (!navigatorWithMidi.requestMIDIAccess) {
    midiInitPromise = Promise.resolve();
    return midiInitPromise;
  }

  midiInitPromise = (async () => {
    try {
      const access = await navigatorWithMidi.requestMIDIAccess!();
      updateMidiOutputs(access);
      access.onstatechange = () => updateMidiOutputs(access);
    } catch (error) {
      console.warn('Web MIDI initialization failed', error);
    }
  })();

  return midiInitPromise;
}

export function playMidiNote(note: Note) {
  if (note < 0 || note > 127) {
    return;
  }

  initMidi().then(() => {
    const outputsToUse = selectedMidiOutputId
      ? midiOutputs.filter((output) => output.id === selectedMidiOutputId)
      : midiOutputs;

    if (outputsToUse.length === 0) {
      return;
    }

    const velocity = 80;
    const noteOn = 0x90;
    const noteOff = 0x80;
    const releaseDelayMs = 300;
    const now = performance.now();

    outputsToUse.forEach((output) => {
      output.send([noteOn, note, velocity]);
      output.send([noteOff, note, 0], now + releaseDelayMs);
    });
  });
}

export function setSelectedMidiOutput(outputId: string | null) {
  selectedMidiOutputId = outputId;
}

export function getSelectedMidiOutputId() {
  return selectedMidiOutputId;
}

export function getMidiOutputsSnapshot() {
  return midiOutputInfos.map((info) => ({ ...info }));
}

export function subscribeMidiOutputs(listener: MidiOutputsListener) {
  midiOutputsListeners.add(listener);
  listener(midiOutputInfos.map((info) => ({ ...info })));
  return () => midiOutputsListeners.delete(listener);
}

export function refreshMidiOutputs() {
  return initMidi();
}
