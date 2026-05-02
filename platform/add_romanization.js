import fs from 'fs';
import path from 'path';
import anyAscii from 'any-ascii';

const dictsDir = path.join(process.cwd(), 'src', 'data', 'dictation');
const NON_LATIN = ['hi', 'ja', 'zh', 'ru'];

// Loop through the dict files
fs.readdirSync(dictsDir).forEach(file => {
  const match = file.match(/^dict_(.*?)\.json$/);
  if (!match) return;
  const lang = match[1];
  
  if (NON_LATIN.includes(lang)) {
    console.log(`Processing ${file}...`);
    const filePath = path.join(dictsDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    let updated = 0;
    for (const item of data) {
      if (!item.romanization) {
        // use anyAscii
        let rom = anyAscii(item.term);
        // capitalize first letter for neatness
        if (rom.length > 0) {
          rom = rom.charAt(0).toUpperCase() + rom.slice(1).toLowerCase();
        }
        item.romanization = rom;
        updated++;
      }
    }
    
    if (updated > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Added romanization to ${updated} items in ${file}`);
    }
  }
});
console.log('Done.');
