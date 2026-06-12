const fs = require('fs');

// Read existing en.json
const enJson = JSON.parse(fs.readFileSync('locales/i18nStrings', 'utf8'));

// Read surahList.js
const surahListContent = fs.readFileSync('data/surahList.js', 'utf8');
const regex = /number: (\d+), nameArabic: '[^']+', nameEnglish: '([^']+)'/g;
let match;
while ((match = regex.exec(surahListContent)) !== null) {
    enJson[`SURAH_${match[1]}_NAME_EN`] = match[2];
}

console.log(JSON.stringify(enJson, null, 2));
