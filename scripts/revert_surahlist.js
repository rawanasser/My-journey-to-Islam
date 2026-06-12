const fs = require('fs');
const enJson = JSON.parse(fs.readFileSync('locales/i18nStrings', 'utf8'));
let content = fs.readFileSync('data/surahList.js', 'utf8');

// Replace strings.SURAH_X_NAME_EN with actual string
content = content.replace(/nameEnglish: strings\.SURAH_(\d+)_NAME_EN/g, (match, num) => {
    const name = enJson['SURAH_' + num + '_NAME_EN'];
    return `nameEnglish: '${name}'`;
});

// Remove import
content = content.replace(/import strings from '\.\.\/locales\/en\.json';\n/, '');

// Fix mmmm... if still present
content = content.replace(/mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm/g, 'startPage');

fs.writeFileSync('data/surahList.js', content, 'utf8');
