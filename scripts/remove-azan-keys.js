/**
 * Script to remove AZAN_* keys from all locale JSON files
 * Run: node scripts/remove-azan-keys.js
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'locales');
const AZAN_KEYS_TO_REMOVE = [
    'AZAN_SETTINGS_TITLE',
    'AZAN_ENABLE_SOUND',
    'AZAN_VIBRATION',
    'AZAN_SELECT_MUEZZIN',
    'AZAN_PRAYER_NOTIFICATIONS',
    'AZAN_PRE_AZAN_NOTIFICATION',
    'AZAN_MINUTES_EARLY',
    'AZAN_SAVE_SUCCESS',
    'AZAN_SAVE_ERROR'
];

function removeAzanKeys() {
    const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));

    console.log(`Found ${files.length} JSON files to process`);

    let totalRemoved = 0;

    files.forEach(file => {
        const filePath = path.join(LOCALES_DIR, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        let removedCount = 0;
        AZAN_KEYS_TO_REMOVE.forEach(key => {
            if (key in content) {
                delete content[key];
                removedCount++;
            }
        });

        if (removedCount > 0) {
            fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
            console.log(`✓ ${file}: removed ${removedCount} AZAN keys`);
            totalRemoved += removedCount;
        } else {
            console.log(`- ${file}: no AZAN keys found`);
        }
    });

    console.log(`\nTotal: removed ${totalRemoved} AZAN keys across ${files.length} files`);
}

removeAzanKeys();
