/**
 * Localize PRAYER_NAME_* and HIJRI_MONTH_* keys across all locales
 * Run: node scripts/localize-prayer-names.js
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'locales');

// Industry-standard localized prayer names
// Format: "Arabic (LocalTranslation)"
const PRAYER_LOCALIZATIONS = {
    'en': { // English - base
        FAJR: 'Fajr', DHUHR: 'Dhuhr', ASR: 'Asr', MAGHRIB: 'Maghrib', ISHA: 'Isha', IMSAK: 'Imsak', DHUHA: 'Dhuha'
    },
    'sv': {
        FAJR: 'Fajr (Gryning)', DHUHR: 'Dhuhr (Middag)', ASR: 'Asr (Eftermiddag)',
        MAGHRIB: 'Maghrib (Solnedgång)', ISHA: 'Isha (Kväll)', IMSAK: 'Imsak (Fastetid)', DHUHA: 'Dhuha (Förmiddag)'
    },
    'fr': {
        FAJR: 'Fajr (Aube)', DHUHR: 'Dhuhr (Midi)', ASR: 'Asr (Après-midi)',
        MAGHRIB: 'Maghrib (Coucher)', ISHA: 'Isha (Soir)', IMSAK: 'Imsak (Jeûne)', DHUHA: 'Dhuha (Matin)'
    },
    'de': {
        FAJR: 'Fajr (Morgen)', DHUHR: 'Dhuhr (Mittag)', ASR: 'Asr (Nachmittag)',
        MAGHRIB: 'Maghrib (Sonnenuntergang)', ISHA: 'Isha (Nacht)', IMSAK: 'Imsak (Fasten)', DHUHA: 'Dhuha (Vormittag)'
    },
    'es': {
        FAJR: 'Fajr (Amanecer)', DHUHR: 'Dhuhr (Mediodía)', ASR: 'Asr (Tarde)',
        MAGHRIB: 'Maghrib (Atardecer)', ISHA: 'Isha (Noche)', IMSAK: 'Imsak (Ayuno)', DHUHA: 'Dhuha (Mañana)'
    },
    'es-MX': {
        FAJR: 'Fajr (Amanecer)', DHUHR: 'Dhuhr (Mediodía)', ASR: 'Asr (Tarde)',
        MAGHRIB: 'Maghrib (Atardecer)', ISHA: 'Isha (Noche)', IMSAK: 'Imsak (Ayuno)', DHUHA: 'Dhuha (Mañana)'
    },
    'it': {
        FAJR: 'Fajr (Alba)', DHUHR: 'Dhuhr (Mezzogiorno)', ASR: 'Asr (Pomeriggio)',
        MAGHRIB: 'Maghrib (Tramonto)', ISHA: 'Isha (Sera)', IMSAK: 'Imsak (Digiuno)', DHUHA: 'Dhuha (Mattina)'
    },
    'pl': {
        FAJR: 'Fajr (Świt)', DHUHR: 'Dhuhr (Południe)', ASR: 'Asr (Popołudnie)',
        MAGHRIB: 'Maghrib (Zachód)', ISHA: 'Isha (Wieczór)', IMSAK: 'Imsak (Post)', DHUHA: 'Dhuha (Przedpołudnie)'
    },
    'da': {
        FAJR: 'Fajr (Daggry)', DHUHR: 'Dhuhr (Middag)', ASR: 'Asr (Eftermiddag)',
        MAGHRIB: 'Maghrib (Solnedgang)', ISHA: 'Isha (Aften)', IMSAK: 'Imsak (Faste)', DHUHA: 'Dhuha (Formiddag)'
    },
    'no': {
        FAJR: 'Fajr (Daggry)', DHUHR: 'Dhuhr (Middag)', ASR: 'Asr (Ettermiddag)',
        MAGHRIB: 'Maghrib (Solnedgang)', ISHA: 'Isha (Kveld)', IMSAK: 'Imsak (Faste)', DHUHA: 'Dhuha (Formiddag)'
    },
    'ro': {
        FAJR: 'Fajr (Zori)', DHUHR: 'Dhuhr (Amiază)', ASR: 'Asr (După-amiază)',
        MAGHRIB: 'Maghrib (Apus)', ISHA: 'Isha (Seară)', IMSAK: 'Imsak (Post)', DHUHA: 'Dhuha (Dimineață)'
    },
    'ru': {
        FAJR: 'Фаджр (Рассвет)', DHUHR: 'Зухр (Полдень)', ASR: 'Аср (После полудня)',
        MAGHRIB: 'Магриб (Закат)', ISHA: 'Иша (Вечер)', IMSAK: 'Имсак (Пост)', DHUHA: 'Духа (Утро)'
    },
    'ja': {
        FAJR: 'ファジュル (夜明け)', DHUHR: 'ズフル (正午)', ASR: 'アスル (午後)',
        MAGHRIB: 'マグリブ (日没)', ISHA: 'イシャー (夜)', IMSAK: 'イムサク (断食)', DHUHA: 'ドゥハー (朝)'
    },
    'ko': {
        FAJR: '파즈르 (새벽)', DHUHR: '두흐르 (정오)', ASR: '아스르 (오후)',
        MAGHRIB: '마그립 (일몰)', ISHA: '이샤 (저녁)', IMSAK: '임삭 (금식)', DHUHA: '두하 (아침)'
    },
    'zh': {
        FAJR: '晨礼 (Fajr)', DHUHR: '晌礼 (Dhuhr)', ASR: '晡礼 (Asr)',
        MAGHRIB: '昏礼 (Maghrib)', ISHA: '宵礼 (Isha)', IMSAK: '封斋 (Imsak)', DHUHA: '上午礼 (Dhuha)'
    },
    'zh-TW': {
        FAJR: '晨禮 (Fajr)', DHUHR: '晌禮 (Dhuhr)', ASR: '晡禮 (Asr)',
        MAGHRIB: '昏禮 (Maghrib)', ISHA: '宵禮 (Isha)', IMSAK: '封齋 (Imsak)', DHUHA: '上午禮 (Dhuha)'
    },
    'hi': {
        FAJR: 'फज्र (सुबह)', DHUHR: 'ज़ुहर (दोपहर)', ASR: 'अस्र (दोपहर बाद)',
        MAGHRIB: 'मग़रिब (सूर्यास्त)', ISHA: 'इशा (रात)', IMSAK: 'इम्साक (रोज़ा)', DHUHA: 'ज़ुहा (सुबह)'
    },
    'el': {
        FAJR: 'Φατζρ (Αυγή)', DHUHR: 'Ντούχρ (Μεσημέρι)', ASR: 'Ασρ (Απόγευμα)',
        MAGHRIB: 'Μαγκρίμπ (Ηλιοβασίλεμα)', ISHA: 'Ίσα (Βράδυ)', IMSAK: 'Ιμσάκ (Νηστεία)', DHUHA: 'Ντούχα (Πρωί)'
    },
    'pt-BR': {
        FAJR: 'Fajr (Aurora)', DHUHR: 'Dhuhr (Meio-dia)', ASR: 'Asr (Tarde)',
        MAGHRIB: 'Maghrib (Pôr do sol)', ISHA: 'Isha (Noite)', IMSAK: 'Imsak (Jejum)', DHUHA: 'Dhuha (Manhã)'
    },
    'is': {
        FAJR: 'Fajr (Dögun)', DHUHR: 'Dhuhr (Hádegi)', ASR: 'Asr (Síðdegi)',
        MAGHRIB: 'Maghrib (Sólsetur)', ISHA: 'Isha (Kvöld)', IMSAK: 'Imsak (Fasta)', DHUHA: 'Dhuha (Morgun)'
    },
    'fil': {
        FAJR: 'Fajr (Bukang-liwayway)', DHUHR: 'Dhuhr (Tanghali)', ASR: 'Asr (Hapon)',
        MAGHRIB: 'Maghrib (Takipsilim)', ISHA: 'Isha (Gabi)', IMSAK: 'Imsak (Pag-aayuno)', DHUHA: 'Dhuha (Umaga)'
    },
    'be': {
        FAJR: 'Фаджр (Світанак)', DHUHR: 'Зухр (Поўдзень)', ASR: 'Аср (Папаўдні)',
        MAGHRIB: 'Магрыб (Захад)', ISHA: 'Іша (Вечар)', IMSAK: 'Імсак (Пост)', DHUHA: 'Духа (Раніца)'
    }
};

function updateLocale(langCode) {
    const filePath = path.join(LOCALES_DIR, `${langCode}.json`);
    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${langCode}.json not found`);
        return false;
    }

    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const localizations = PRAYER_LOCALIZATIONS[langCode] || PRAYER_LOCALIZATIONS['en'];

    let updated = false;

    // Update PRAYER_NAME_* keys
    const prayerKeys = ['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA', 'IMSAK', 'DHUHA'];
    prayerKeys.forEach(prayer => {
        const key = `PRAYER_NAME_${prayer}`;
        if (localizations[prayer] && content[key] !== localizations[prayer]) {
            content[key] = localizations[prayer];
            updated = true;
        }
    });

    if (updated) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
        console.log(`✓ ${langCode}.json: prayer names localized`);
    } else {
        console.log(`- ${langCode}.json: already up-to-date or using defaults`);
    }

    return updated;
}

function main() {
    console.log('=== Localizing Prayer Names ===\n');

    const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json') && f !== 'en.json');
    let updatedCount = 0;

    files.forEach(file => {
        const langCode = file.replace('.json', '');
        if (updateLocale(langCode)) {
            updatedCount++;
        }
    });

    console.log(`\nTotal: ${updatedCount} files updated`);
}

main();
