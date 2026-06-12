/**
 * Translation Verification Script
 * Run: node scripts/verify-translations.js
 * 
 * Checks:
 * 1. Key parity with en.json
 * 2. English leakage detection
 * 3. hisnAlMuslim content verification
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'locales');
const enContent = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, 'en.json'), 'utf8'));

// Common English words that shouldn't appear in translated content
const ENGLISH_WORDS = ['the', 'and', 'that', 'you', 'for', 'with', 'from', 'upon', 'your', 'him', 'his', 'her', 'them', 'who', 'which', 'this', 'these', 'those', 'what', 'when', 'where', 'how', 'why', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall'];

// Words that should NOT be flagged (Arabic/Islamic terms)
const ALLOWED_WORDS = ['allah', 'muhammad', 'prophet', 'quran', 'surah', 'sunnah', 'hadith', 'imam', 'muslim', 'islam', 'ramadan', 'hijri', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'bukhari', 'dawud', 'tirmidhi', 'nasa', 'majah', 'sahih', 'hasan', 'dhikr', 'dua', 'witr', 'qunut', 'ruku', 'sujud', 'tashahhud', 'salam', 'takbir', 'subhanallah', 'alhamdulillah', 'allahu', 'akbar', 'muharram', 'safar', 'rabi', 'jumada', 'rajab', 'shaaban', 'shawwal', 'qidah', 'hijjah'];

function getAllKeys(obj, prefix = '') {
    let keys = [];
    for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            keys = keys.concat(getAllKeys(obj[key], fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

function detectEnglishLeakage(text, langCode) {
    if (typeof text !== 'string') return [];

    const words = text.toLowerCase().split(/\s+/);
    const leaks = [];

    for (const word of words) {
        const cleanWord = word.replace(/[^a-z]/g, '');
        if (cleanWord.length > 2 &&
            ENGLISH_WORDS.includes(cleanWord) &&
            !ALLOWED_WORDS.includes(cleanWord)) {
            leaks.push(cleanWord);
        }
    }

    return [...new Set(leaks)];
}

function checkHisnContent(obj, path = '', langCode) {
    let issues = [];

    if (Array.isArray(obj)) {
        obj.forEach((item, idx) => {
            const leaks = detectEnglishLeakage(item, langCode);
            if (leaks.length > 0) {
                issues.push({ path: `${path}[${idx}]`, leaks, sample: item.substring(0, 50) });
            }
        });
    } else if (typeof obj === 'object' && obj !== null) {
        for (const key of Object.keys(obj)) {
            issues = issues.concat(checkHisnContent(obj[key], `${path}.${key}`, langCode));
        }
    }

    return issues;
}

function verifyLocale(langCode) {
    const filePath = path.join(LOCALES_DIR, `${langCode}.json`);
    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${langCode}.json not found`);
        return null;
    }

    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const enKeys = getAllKeys(enContent);
    const langKeys = getAllKeys(content);

    // Key parity check
    const missingKeys = enKeys.filter(k => !langKeys.includes(k));
    const extraKeys = langKeys.filter(k => !enKeys.includes(k));

    // HisnAlMuslim content check
    let hisnIssues = [];
    if (langCode !== 'en' && content.hisnAlMuslim) {
        hisnIssues = checkHisnContent(content.hisnAlMuslim, 'hisnAlMuslim', langCode);
    }

    return {
        langCode,
        totalKeys: langKeys.length,
        missingKeys: missingKeys.length,
        extraKeys: extraKeys.length,
        hisnIssues: hisnIssues.length,
        details: {
            missing: missingKeys.slice(0, 5),
            extra: extraKeys.slice(0, 5),
            hisnSamples: hisnIssues.slice(0, 3)
        }
    };
}

function main() {
    console.log('=== Translation Verification Report ===\n');

    const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json') && f !== 'en.json');
    const results = [];

    console.log(`English reference: ${getAllKeys(enContent).length} keys\n`);
    console.log('| Locale | Keys | Missing | Extra | HisnIssues |');
    console.log('|--------|------|---------|-------|------------|');

    for (const file of files) {
        const langCode = file.replace('.json', '');
        const result = verifyLocale(langCode);
        if (result) {
            results.push(result);
            console.log(`| ${result.langCode.padEnd(6)} | ${result.totalKeys.toString().padStart(4)} | ${result.missingKeys.toString().padStart(7)} | ${result.extraKeys.toString().padStart(5)} | ${result.hisnIssues.toString().padStart(10)} |`);
        }
    }

    console.log('\n=== Summary ===');
    const withIssues = results.filter(r => r.missingKeys > 0 || r.hisnIssues > 0);
    console.log(`Files with issues: ${withIssues.length}/${results.length}`);

    // Show detailed issues for worst files
    const worstFiles = results.sort((a, b) => b.hisnIssues - a.hisnIssues).slice(0, 3);
    if (worstFiles.length > 0 && worstFiles[0].hisnIssues > 0) {
        console.log('\n=== Top 3 Files with Most English Leakage ===');
        worstFiles.forEach(f => {
            if (f.hisnIssues > 0) {
                console.log(`\n${f.langCode}: ${f.hisnIssues} potential English leaks`);
                f.details.hisnSamples.forEach(s => {
                    console.log(`  - ${s.path}: "${s.sample}..."`);
                });
            }
        });
    }
}

main();
