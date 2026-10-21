// scripts/postbuild.mjs
// Deux finitions appliquées à dist/ après `astro build`, invisibles dans le code
// source (les fichiers de public/ restent lisibles) :
//   1. minification du CSS statique, qu'Astro copie tel quel ;
//   2. préchargement de la police latine, seule graisse utilisée au premier écran.
// Le build CI passe par `npm run build`, donc ces finitions partent en prod.

import fs from 'node:fs';
import path from 'node:path';
import * as esbuild from 'esbuild';

const DIST = 'dist';

const walk = (dir, filter) => {
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...walk(full, filter));
        else if (filter(entry.name)) out.push(full);
    }
    return out;
};

// 1. CSS
let savedBytes = 0;
const cssFiles = walk(DIST, (n) => n.endsWith('.css'));
for (const file of cssFiles) {
    const before = fs.readFileSync(file, 'utf8');
    const { code } = await esbuild.transform(before, { loader: 'css', minify: true });
    savedBytes += Buffer.byteLength(before) - Buffer.byteLength(code);
    fs.writeFileSync(file, code);
}
console.log(`[postbuild] CSS minifié : ${cssFiles.length} fichier(s), ${(savedBytes / 1024).toFixed(1)} Ko économisés`);

// 2. Police
// Le latin est le seul sous-ensemble chargé par les visiteurs ; précharger un
// sous-ensemble cyrillique serait une requête inutile.
const FONT = /\/_astro\/inter-latin-wght-normal\.[A-Za-z0-9_-]+\.woff2/;
let pages = 0;
for (const file of walk(DIST, (n) => n.endsWith('.html'))) {
    let html = fs.readFileSync(file, 'utf8');
    if (html.includes('rel="preload" as="font"')) continue;
    const match = html.match(FONT);
    if (!match) continue;
    const tag = `<link rel="preload" as="font" type="font/woff2" href="${match[0]}" crossorigin>`;
    // Le charset doit rester la première balise : on précharge juste après.
    const charset = html.match(/<meta charset="[^"]*">/i);
    if (charset) {
        html = html.replace(charset[0], `${charset[0]}${tag}`);
    } else if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${tag}`);
    } else {
        console.warn(`[postbuild] pas de <head> dans ${file}, préchargement ignoré`);
        continue;
    }
    fs.writeFileSync(file, html);
    pages++;
}
console.log(`[postbuild] police préchargée sur ${pages} page(s)`);
