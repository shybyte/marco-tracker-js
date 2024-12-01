const INSTRUMENTS = ['marimba'];
import fs from 'node:fs';
import path from 'node:path';

const LOCAL_INSTRUMENT_PATH = 'src/assets/samples/';

fs.mkdirSync(LOCAL_INSTRUMENT_PATH, { recursive: true });

for (const instrument of INSTRUMENTS) {
  const originalFilename = instrument + '-ogg.js';
  const localPath = path.join(LOCAL_INSTRUMENT_PATH, originalFilename + '.txt');

  if (fs.existsSync(localPath)) {
    console.log('File exist already:', localPath);
    continue;
  }

  console.log('Downloading ... ', originalFilename);
  const fileContent = await fetch('https://gleitz.github.io/midi-js-soundfonts/MusyngKite/' + originalFilename).then(
    (res) => res.text(),
  );
  fs.writeFileSync(localPath, fileContent);
}
