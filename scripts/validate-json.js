/**
 * Validate JSON syntax in all locale files
 * Run: node scripts/validate-json.js
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'locales');

function validateJsonFiles() {
    console.log('=== JSON Validation Report ===\n');

    const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
    let errorCount = 0;
    let validCount = 0;

    files.forEach(file => {
        const filePath = path.join(LOCALES_DIR, file);
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            JSON.parse(content);
            console.log(`✓ ${file} - valid JSON`);
            validCount++;
        } catch (error) {
            console.log(`❌ ${file} - INVALID: ${error.message}`);
            errorCount++;
        }
    });

    console.log(`\n=== Summary ===`);
    console.log(`Valid: ${validCount}/${files.length}`);
    console.log(`Errors: ${errorCount}`);

    if (errorCount > 0) {
        console.log('\n⚠️  FIX THE ABOVE ERRORS BEFORE RUNNING THE APP');
        process.exit(1);
    } else {
        console.log('\n✅ All JSON files are valid');
    }
}

validateJsonFiles();
