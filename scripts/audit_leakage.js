const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'locales');
const sourceFile = path.join(localesDir, 'en.json');
const targetFiles = [
    'fr.json', 'es.json', 'es-MX.json', 'it.json', 'de.json', 'pl.json', 'da.json', 'ro.json', 'ru.json', 'ja.json', 'zh.json', 'zh-TW.json', 'ko.json', 'hi.json', 'no.json', 'sv.json', 'el.json', 'pt-BR.json', 'is.json', 'fil.json', 'be.json'
];

const PRESERVE_PATTERNS = [
    /^SURAH_\d+_NAME_EN$/,
    /arabic/i,
    /reference/i,
    /source/i,
    /transliteration/i
];

function isPreserved(key) {
    return PRESERVE_PATTERNS.some(p => p.test(key));
}

function getLeakage(source, target, prefix = '') {
    let leakage = [];
    for (let key in source) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (isPreserved(fullKey)) continue;

        const sourceVal = source[key];
        const targetVal = target[key];

        if (targetVal === undefined) continue; // Parity check is separate

        if (typeof sourceVal === 'object' && !Array.isArray(sourceVal)) {
            leakage = leakage.concat(getLeakage(sourceVal, targetVal || {}, fullKey));
        } else if (Array.isArray(sourceVal)) {
            if (!Array.isArray(targetVal)) continue;
            sourceVal.forEach((item, i) => {
                if (typeof item === 'string' && item === targetVal[i] && item.trim() !== '' && item.length > 3) {
                    leakage.push(`${fullKey}[${i}]`);
                }
            });
        } else if (typeof sourceVal === 'string' && sourceVal === targetVal && sourceVal.trim() !== '' && sourceVal.length > 2) {
            // Only count as leakage if it looks like English (basic check)
            // Or if it's a known UI key that shouldn't be the same across languages
            leakage.push(fullKey);
        }
    }
    return leakage;
}

const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

targetFiles.forEach(file => {
    const filePath = path.join(localesDir, file);
    if (!fs.existsSync(filePath)) return;

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const leakage = getLeakage(sourceData, data);

        if (leakage.length > 0) {
            console.log(`\n[LEAKAGE] ${file}: ${leakage.length} items (e.g., ${leakage.slice(0, 5).join(', ')}...)`);
        } else {
            console.log(`[CLEAN] ${file}`);
        }
    } catch (e) {
        console.log(`[ERROR] ${file}: Invalid JSON`);
    }
});
