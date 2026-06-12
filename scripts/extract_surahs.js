const fs = require('fs');
const content = fs.readFileSync('data/surahList.js', 'utf8');
const regex = /number: (\d+), nameArabic: '[^']+', nameEnglish: '([^']+)'/g;
let match;
const surahs = {};
while ((match = regex.exec(content)) !== null) {
    surahs[`SURAH_${match[1]}_NAME_EN`] = match[2];
}
console.log(JSON.stringify(surahs, null, 2));
