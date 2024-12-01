import { Soundfont } from 'smplr';
import { Note } from './song';
import { F0 } from './notes';

let context: AudioContext;

class InstrumentPlayer {
  private soundFont: Soundfont;

  constructor() {
    this.soundFont = new Soundfont(context, {
      instrumentUrl: 'http://localhost:3000/src/assets/samples/marimba-ogg.js.txt',
    });
  }

  playNote(note: Note) {
    this.soundFont.load.then(() => {
      this.soundFont.start({ note: note, velocity: 80 });
    });
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

export function playNote(note: Note) {
  initSound();
  player.playNote(note);
}
