const fs = require('fs');
const path = require('path');

const files = [
  'public/.well-known/farcaster.json',
  'public/manifest.json'
];

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    try {
      const buf = fs.readFileSync(filePath);
      let str;

      // Check for BOM
      if (buf.length >= 2 && buf[0] === 0xFF && buf[1] === 0xFE) {
        // UTF-16LE
        console.log(`${file} detected as UTF-16LE`);
        str = buf.toString('utf16le');
      } else if (buf.length >= 2 && buf[0] === 0xFE && buf[1] === 0xFF) {
        // UTF-16BE
        console.log(`${file} detected as UTF-16BE`);
        str = buf.toString('utf16be');
      } else if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
        // UTF-8 with BOM
        console.log(`${file} detected as UTF-8 with BOM`);
        str = buf.toString('utf8').slice(1); // Strip BOM
      } else {
        // Assume UTF-8
        console.log(`${file} treated as UTF-8`);
        str = buf.toString('utf8');
      }

      // Clean up any remaining BOM-like characters just in case
      str = str.replace(/^\uFEFF/, '');

      // Validate JSON
      JSON.parse(str);

      // Write back as pure UTF-8 without BOM
      fs.writeFileSync(filePath, str, { encoding: 'utf8' });
      console.log(`Successfully converted ${file} to UTF-8`);
    } catch (e) {
      console.error(`Error processing ${file}:`, e);
    }
  }
});
