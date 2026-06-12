const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'locales');
const sourceFile = path.join(localesDir, 'en.json');
const targetFiles = [
    'fr.json', 'es.json', 'es-MX.json', 'it.json', 'de.json', 'pl.json', 'da.json', 'ro.json', 'ru.json', 'ja.json', 'zh.json', 'zh-TW.json', 'ko.json', 'hi.json', 'no.json', 'sv.json', 'el.json', 'pt-BR.json', 'is.json', 'fil.json', 'be.json'
];

function getKeys(obj, prefix = '') {
    let keys = [];
    for (let key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
            keys = keys.concat(getKeys(obj[key], fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
const sourceKeys = getKeys(sourceData);
console.log(`Source of Truth (en.json) has ${sourceKeys.length} keys.`);

targetFiles.forEach(file => {
    const filePath = path.join(localesDir, file);
    if (!fs.existsSync(filePath)) {
        console.log(`[MISSING FILE] ${file}`);
        return;
    }

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const keys = getKeys(data);

        const missing = sourceKeys.filter(k => !keys.includes(k));
        const extra = keys.filter(k => !sourceKeys.includes(k));

        if (missing.length > 0 || extra.length > 0) {
            console.log(`\n[ISSUE] ${file}:`);
            if (missing.length > 0) console.log(`  - Missing ${missing.length} keys (e.g., ${missing.slice(0, 3).join(', ')}...)`);
            if (extra.length > 0) console.log(`  - Extra ${extra.length} keys (e.g., ${extra.slice(0, 3).join(', ')}...)`);
        } else {
            console.log(`[PASS] ${file} - 100% Key Parity.`);
        }
    } catch (e) {
        console.log(`[ERROR] ${file}: Invalid JSON`);
    }
});
