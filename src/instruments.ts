import { getSoundfontNames, Soundfont, SoundfontOptions } from 'smplr';
import { Note } from './song';

let context: AudioContext;

export const LOCAL_INSTRUMENTS = ['marimba'];

class InstrumentPlayer {
  private soundFountByName = new Map<string, Soundfont>();

  constructor() {
    const soundfontNames = getSoundfontNames();
    console.log('soundfontNames', soundfontNames);

    this.getSoundFont(LOCAL_INSTRUMENTS[0]);
  }

  playNote(instrument: string, note: Note) {
    const soundFont = this.getSoundFont(instrument);

    if (!soundFont) {
      return;
    }

    soundFont.load.then(() => {
      soundFont.start({ note: note, velocity: 80 });
    });
  }

  private getSoundFont(instrument: string) {
    let soundFont = this.soundFountByName.get(instrument);

    if (!soundFont) {
      const options: SoundfontOptions = LOCAL_INSTRUMENTS.includes(instrument)
        ? {
            instrumentUrl: new URL(`/src/assets/samples/${instrument}-ogg.js.txt`, window.location.href).href,
          }
        : { instrument };

      soundFont = new Soundfont(context, options);

      if (!soundFont) {
        console.error(`Instrument ${instrument} not found`);
        return;
      }

      this.soundFountByName.set(instrument, soundFont);
    }

    return soundFont;
  }
}

let player: InstrumentPlayer;

export function initSound() {
  if (!context) {
    context = new AudioContext();
  }

  if (!player) {
    player = new InstrumentPlayer();
  }
}

export function playNote(instrument: string, note: Note) {
  initSound();
  player.playNote(instrument, note);
}
