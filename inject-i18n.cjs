const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'public/media/locales/en.js');
let localesContent = fs.readFileSync(localesPath, 'utf8');

// Extract the dictionary object from en.js
const dictRegex = /const frToEn = (\{[\s\S]*?\});/;
const match = localesContent.match(dictRegex);
if (!match) {
    console.error("Could not parse en.js");
    process.exit(1);
}

// Evaluate the dictionary
let frToEn;
try {
    // Add missing comma if any (fix for "Statut indisponible")
    let jsonStr = match[1].replace(/"Statut indisponible": "Status unavailable"\s*"Télécharger/g, '"Statut indisponible": "Status unavailable",\n    "Télécharger');
    frToEn = eval('(' + jsonStr + ')');
} catch(e) {
    console.error("Eval failed", e);
    process.exit(1);
}

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

walk('src', (filePath) => {
    if (filePath.endsWith('.astro')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // For each dictionary key, we try to find it inside HTML tags
        // and inject data-i18n if it's the only text inside the tag.
        for (const [key, value] of Object.entries(frToEn)) {
            // Skip keys that are already explicitly mapped using data-i18n-html
            if (key.startsWith("tuto_arr_") || key.startsWith("tuto_alias_")) continue;
            
            // Regex to find: <tag (not containing data-i18n) > KEY </tag>
            // We want to add data-i18n="KEY" to the tag.
            // This regex matches an opening tag (with no data-i18n), optional whitespace, the exact key, optional whitespace, closing tag
            const keyEscaped = escapeRegExp(key);
            // We must be careful not to match across different elements.
            // Regex: (<[a-zA-Z0-9]+(?: [^>]+)?)>(\s*)KEY(\s*<\/[a-zA-Z0-9]+>)
            // Ensure no data-i18n is already present
            const r = new RegExp(`(<[a-zA-Z1-6]+(?: (?!data-i18n)[^>]+)?)>(\\s*${keyEscaped}\\s*<\/[a-zA-Z1-6]+>)`, 'g');
            
            if (r.test(content)) {
                content = content.replace(r, `$1 data-i18n="${key.replace(/"/g, '&quot;')}">$2`);
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log("Injected data-i18n into", filePath);
        }
    }
});
