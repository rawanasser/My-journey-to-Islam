const fs = require('fs');
const path = require('path');
const { translate } = require('google-translate-api-x');

const localesDir = path.join(__dirname, 'locales');
const sourceFile = path.join(localesDir, 'en.json');

const targetLocales = [
    { file: 'fr.json', code: 'fr' },
    { file: 'es.json', code: 'es' },
    { file: 'es-MX.json', code: 'es' },
    { file: 'it.json', code: 'it' },
    { file: 'de.json', code: 'de' },
    { file: 'pl.json', code: 'pl' },
    { file: 'da.json', code: 'da' },
    { file: 'ro.json', code: 'ro' },
    { file: 'ru.json', code: 'ru' },
    { file: 'ja.json', code: 'ja' },
    { file: 'zh.json', code: 'zh-CN' },
    { file: 'zh-TW.json', code: 'zh-TW' },
    { file: 'ko.json', code: 'ko' },
    { file: 'hi.json', code: 'hi' },
    { file: 'no.json', code: 'no' },
    { file: 'sv.json', code: 'sv' },
    { file: 'el.json', code: 'el' },
    { file: 'pt-BR.json', code: 'pt' },
    { file: 'is.json', code: 'is' },
    { file: 'fil.json', code: 'tl' },
    { file: 'be.json', code: 'be' },
];

const PRESERVE_KEY_NAMES = ['arabic', 'reference', 'source', 'transliteration'];
const PRESERVE_PATTERNS = [
    /^SURAH_\d+_NAME_EN$/
];

const REFERENCE_MARKERS = [
    'Bukhari', 'Abu Dawud', 'Tirmidhi', 'Nasa\'i', 'Ibn Majah',
    'Ahmad', 'Muwatta', 'Sahih Muslim', 'Vol.', 'p.', 'no.', 'graded as', 'authenticated by'
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function translateBatch(texts, targetLang, attempt = 1) {
    if (!texts || texts.length === 0) return [];

    // Split into chunks of 20 to be safe and avoid long payloads
    const chunkSize = 20;
    const results = [];

    for (let i = 0; i < texts.length; i += chunkSize) {
        const chunk = texts.slice(i, i + chunkSize);
        console.log(`Translating chunk ${i / chunkSize + 1} of ${Math.ceil(texts.length / chunkSize)} to ${targetLang}...`);

        let success = false;
        let chunkAttempt = 1;

        while (!success && chunkAttempt <= 5) {
            try {
                const hosts = ['translate.google.com', 'translate.google.fr', 'translate.google.de', 'translate.google.it', 'translate.google.co.uk'];
                const randomHost = hosts[Math.floor(Math.random() * hosts.length)];

                const res = await translate(chunk, {
                    to: targetLang,
                    forceHost: true,
                    host: randomHost,
                    rejectOnPartialFail: false,
                    forceBatch: false
                });

                results.push(...res.map((r, idx) => (r && r.text) ? r.text : chunk[idx]));
                success = true;
                await delay(2000); // 2s between chunks
            } catch (error) {
                if (error.message.includes('429')) {
                    const waitTime = chunkAttempt * 60000;
                    console.log(`Rate limited (429). Waiting ${waitTime / 1000}s (Attempt ${chunkAttempt})...`);
                    await delay(waitTime);
                    chunkAttempt++;
                } else {
                    console.error(`Chunk error: ${error.message}`);
                    throw error;
                }
            }
        }
        if (!success) throw new Error("Failed after 5 attempts");
    }
    return results;
}

function isReference(text) {
    if (typeof text !== 'string') return false;
    if (text.length < 50 && /\d+\/\d+/.test(text)) return true;
    return REFERENCE_MARKERS.some(marker => text.includes(marker));
}

function shouldPreserve(key, value) {
    if (PRESERVE_KEY_NAMES.includes(key.toLowerCase())) return true;
    if (PRESERVE_PATTERNS.some(p => p.test(key))) return true;
    return false;
}

async function auditLocale(locale) {
    console.log(`\n========== Auditing ${locale.file} (${locale.code}) ==========`);
    const targetPath = path.join(localesDir, locale.file);
    const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

    let targetData = {};
    if (fs.existsSync(targetPath)) {
        try { targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8')); } catch (e) { }
    }

    const queue = []; // [{path, text, type: 'value'|'key'}]

    function collect(source, target, keyPath = '') {
        for (const key in source) {
            const currentPath = keyPath ? `${keyPath}.${key}` : key;
            const sourceVal = source[key];
            const targetVal = target[key];

            // Special handling for hisnAlMuslim category keys
            if (keyPath.includes('hisnAlMuslim') && key !== 'text' && key !== 'footnote') {
                const isEng = /^[a-zA-Z\s()\-']+$/.test(key);
                if (isEng && locale.code !== 'en') {
                    queue.push({ path: currentPath, text: key, type: 'key' });
                }
            }

            if (shouldPreserve(key, sourceVal)) continue;

            if (Array.isArray(sourceVal)) {
                sourceVal.forEach((item, idx) => {
                    const tVal = (targetVal && targetVal[idx]);
                    if (typeof item === 'string' && !isReference(item)) {
                        const isLeak = tVal && /^[a-zA-Z\s,.'!✨?%{}()\-]+$/.test(tVal) && tVal.split(' ').length > 1;
                        if (!tVal || tVal === item || isLeak) {
                            queue.push({ path: `${currentPath}[${idx}]`, text: item, type: 'value' });
                        }
                    } else if (typeof item === 'object') {
                        collect(item, tVal || {}, `${currentPath}[${idx}]`);
                    }
                });
            } else if (typeof sourceVal === 'object') {
                collect(sourceVal, targetVal || {}, currentPath);
            } else if (typeof sourceVal === 'string') {
                if (!isReference(sourceVal)) {
                    const isLeak = targetVal && /^[a-zA-Z\s,.'!✨?%{}()\-]+$/.test(targetVal) && targetVal.split(' ').length > 1;
                    if (!targetVal || targetVal === sourceVal || isLeak) {
                        queue.push({ path: currentPath, text: sourceVal, type: 'value' });
                    }
                }
            }
        }
    }

    collect(sourceData, targetData);

    if (queue.length === 0) {
        console.log(`- ${locale.file} is already complete.`);
        return;
    }

    console.log(`Found ${queue.length} items to translate.`);
    const translatedTexts = await translateBatch(queue.map(q => q.text), locale.code);

    const updates = {};
    queue.forEach((item, idx) => { updates[item.path] = translatedTexts[idx]; });

    // Reconstruction
    function reconstruct(source, target, keyPath = '') {
        const result = {};
        for (const key in source) {
            const currentPath = keyPath ? `${keyPath}.${key}` : key;
            const sourceVal = source[key];

            let targetKey = key;
            if (updates[currentPath] && queue.find(q => q.path === currentPath && q.type === 'key')) {
                targetKey = updates[currentPath];
            }

            if (shouldPreserve(key, sourceVal)) {
                result[targetKey] = sourceVal;
                continue;
            }

            if (Array.isArray(sourceVal)) {
                result[targetKey] = sourceVal.map((item, idx) => {
                    const p = `${currentPath}[${idx}]`;
                    if (updates[p]) return updates[p];
                    if (typeof item === 'object') return reconstruct(item, (target && target[targetKey] && target[targetKey][idx]) || {}, p);
                    return (target && target[targetKey] && target[targetKey][idx]) || item;
                });
            } else if (typeof sourceVal === 'object') {
                result[targetKey] = reconstruct(sourceVal, target && target[targetKey] || {}, currentPath);
            } else if (typeof sourceVal === 'string') {
                result[targetKey] = updates[currentPath] || (target && target[targetKey]) || sourceVal;
            }
        }
        return result;
    }

    const finalResult = reconstruct(sourceData, targetData);
    fs.writeFileSync(targetPath, JSON.stringify(finalResult, null, 2), 'utf8');
    console.log(`✓ Completed ${locale.file}`);
}

async function main() {
    console.log('Starting Aggressive Batch Localization Audit...');
    const args = process.argv.slice(2);
    let filteredLocales = targetLocales;

    if (args.length > 0) {
        filteredLocales = targetLocales.filter(l => args.includes(l.file.replace('.json', '')) || args.includes(l.file));
        console.log(`Filtering for: ${filteredLocales.map(l => l.file).join(', ')}`);
    }

    for (const locale of filteredLocales) {
        try {
            await auditLocale(locale);
        } catch (error) {
            console.error(`Skipping ${locale.file} due to persistent error: ${error.message}`);
            await delay(10000);
        }
    }
}

main();
