const fs = require('fs');
const path = require('path');
const { translate } = require('google-translate-api-x');

const localesDir = path.join(__dirname, 'locales');
const sourceFile = path.join(localesDir, 'en.json');

// Target languages with their codes
const targetLanguages = [
    { file: 'ru.json', code: 'ru' },
    { file: 'ja.json', code: 'ja' },
    { file: 'zh.json', code: 'zh-CN' },
    { file: 'zh-TW.json', code: 'zh-TW' },
    { file: 'ko.json', code: 'ko' },
    { file: 'hi.json', code: 'hi' },
    { file: 'da.json', code: 'da' },
    { file: 'ro.json', code: 'ro' },
    { file: 'no.json', code: 'no' },
    { file: 'sv.json', code: 'sv' },
    { file: 'el.json', code: 'el' },
    { file: 'pt-BR.json', code: 'pt' },
    { file: 'is.json', code: 'is' },
    { file: 'fil.json', code: 'tl' },
    { file: 'es-MX.json', code: 'es' },
    { file: 'be.json', code: 'be' },
];

// Keys that should NOT be translated (Surah names, Arabic terms)
const keysToPreserve = (key) => {
    return key.startsWith('SURAH_') ||
        key.startsWith('PRAYER_NAME_') ||
        key.startsWith('HIJRI_MONTH_') ||
        key === 'HIJRI_AH';
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function translateText(text, targetLang) {
    if (!text || typeof text !== 'string') return text;

    try {
        const result = await translate(text, { to: targetLang });
        return result.text;
    } catch (error) {
        console.error(`Translation error for "${text.substring(0, 50)}...": ${error.message}`);
        return text; // Return original on error
    }
}

async function translateFile(lang) {
    console.log(`\n========== Processing ${lang.file} ==========`);

    const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
    const targetPath = path.join(localesDir, lang.file);

    // Start with existing data if file exists
    let targetData = {};
    if (fs.existsSync(targetPath)) {
        try {
            targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
        } catch (e) {
            targetData = {};
        }
    }

    const keys = Object.keys(sourceData);
    let translated = 0;

    for (const key of keys) {
        // Skip Surah names and Arabic terms
        if (keysToPreserve(key)) {
            targetData[key] = sourceData[key];
            continue;
        }

        // Skip hisnAlMuslim section (Adhkar content)
        if (key === 'hisnAlMuslim') {
            targetData[key] = sourceData[key];
            continue;
        }

        const value = sourceData[key];

        // Translate strings only
        if (typeof value === 'string') {
            targetData[key] = await translateText(value, lang.code);
            translated++;

            // Progress update every 20 keys
            if (translated % 20 === 0) {
                console.log(`  Translated ${translated} keys...`);
                fs.writeFileSync(targetPath, JSON.stringify(targetData, null, 2), 'utf8');
            }

            await delay(100); // Rate limiting
        } else {
            targetData[key] = value;
        }
    }

    fs.writeFileSync(targetPath, JSON.stringify(targetData, null, 2), 'utf8');
    console.log(`✓ Completed ${lang.file} (${translated} strings translated)`);
}

async function main() {
    console.log('Starting locale translations...');
    console.log(`Source: ${sourceFile}`);
    console.log(`Target languages: ${targetLanguages.length}`);

    for (const lang of targetLanguages) {
        await translateFile(lang);
        await delay(1000); // Delay between files
    }

    console.log('\n========== ALL TRANSLATIONS COMPLETE ==========');
}

main().catch(console.error);
