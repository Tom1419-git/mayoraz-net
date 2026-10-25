// lastmod du sitemap : date du dernier commit qui a réellement touché la page.
//
// Une page ne dépend pas seulement de son fichier : ses composants et son layout
// changent aussi le HTML produit. On suit donc récursivement les imports locaux
// (.astro, .md, .ts…) avant de demander à git la date du commit le plus récent
// parmi tous ces fichiers.
//
// Si git est indisponible (archive, clone sans historique), on renvoie null :
// le sitemap n'écrit alors pas de lastmod, plutôt qu'une date inventée.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const PAGES_DIR = path.join(ROOT, 'src/pages');

const IMPORT_RE = /^\s*import\s+(?:[^'"]*?\s+from\s+)?['"](\.[^'"]+)['"]/gm;
const EXTENSIONS = ['', '.astro', '.md', '.mdx', '.ts', '.js', '/index.astro', '/index.md'];

function resolveLocal(spec, fromFile) {
    const base = path.resolve(path.dirname(fromFile), spec);
    for (const ext of EXTENSIONS) {
        const candidate = base + ext;
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    }
    return null;
}

function collectDependencies(file, seen = new Set()) {
    if (seen.has(file) || !fs.existsSync(file)) return seen;
    seen.add(file);
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(IMPORT_RE)) {
        const target = resolveLocal(match[1], file);
        if (target && target.startsWith(ROOT)) collectDependencies(target, seen);
    }
    return seen;
}

function lastCommitDate(files) {
    try {
        const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...files], {
            cwd: ROOT,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
        return out || null;
    } catch {
        return null;
    }
}

function pageFileFor(url) {
    const pathname = decodeURIComponent(new URL(url).pathname);
    const candidates = pathname.endsWith('/')
        ? [path.join(PAGES_DIR, pathname, 'index.astro'), path.join(PAGES_DIR, pathname, 'index.md')]
        : [path.join(PAGES_DIR, `${pathname}.astro`), path.join(PAGES_DIR, pathname, 'index.astro')];
    return candidates.find((file) => fs.existsSync(file)) || null;
}

// Un clone superficiel (fetch-depth 1) ne connaît que le dernier commit : toutes
// les pages hériteraient de sa date, ce qui est faux. Dans ce cas on n'écrit rien.
function hasUsableHistory() {
    try {
        const shallow = execFileSync('git', ['rev-parse', '--is-shallow-repository'], {
            cwd: ROOT,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
        return shallow !== 'true';
    } catch {
        return false;
    }
}

export function createLastmodResolver() {
    const cache = new Map();
    const historyUsable = hasUsableHistory();
    return function lastmodFor(url) {
        if (!historyUsable) return null;
        if (cache.has(url)) return cache.get(url);
        const pageFile = pageFileFor(url);
        const date = pageFile
            ? lastCommitDate([...collectDependencies(pageFile)].map((f) => path.relative(ROOT, f)))
            : null;
        cache.set(url, date);
        return date;
    };
}
