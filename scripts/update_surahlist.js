const fs = require('fs');
let content = fs.readFileSync('data/surahList.js', 'utf8');

// Replace nameEnglish: '...' with nameEnglish: strings.SURAH_X_NAME_EN
content = content.replace(/number: (\d+), nameArabic: '([^']+)', nameEnglish: '([^']+)'/g, (match, num, arabic, english) => {
    return `number: ${num}, nameArabic: '${arabic}', nameEnglish: strings.SURAH_${num}_NAME_EN`;
});

// Add import
if (!content.includes("import strings")) {
    content = "import strings from '../locales/i18nStrings';\n" + content;
}

fs.writeFileSync('data/surahList.js', content, 'utf8');
