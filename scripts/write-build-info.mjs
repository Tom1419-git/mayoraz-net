#!/usr/bin/env node
/**
 * Ecrit dist/build.json : source de verite du dernier deploy réussi
 * (timestamp UTC ISO 8601 + sha du commit de build).
 *
 * Ceremonie minimale :
 * - le timestamp vient de l'horloge de la machine qui construit le site ;
 * - le sha est pris de GITHUB_SHA si present, sinon git rev-parse HEAD ;
 * - en cas d'echec (git absent, poussieres), on ecrit un build.json de secours
 *   marque "degraded" plutot que de faire echouer le deploy pour un badge.
 * Le script est indempotent : relancer le build ne change que le timestamp.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(process.cwd(), 'dist');
const OUT = path.join(DIST, 'build.json');

function safe(cmd, args) {
    try {
        return execFileSync(cmd, args, { encoding: 'utf8', timeout: 10_000 }).trim();
    } catch {
        return null;
    }
}

function isoNow() {
    // date -u est disponible sur Linux (runner CI) et macOS (build local).
    const out = safe('date', ['-u', '+%Y-%m-%dT%H:%M:%SZ']);
    return out || new Date().toISOString().replace(/\.\d+Z$/, 'Z');
}

function sha() {
    if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
    return safe('git', ['rev-parse', 'HEAD']);
}

const commit = sha();
const timestamp = isoNow();

const payload = commit
    ? { timestamp, sha: commit, status: 'ok' }
    : { timestamp, sha: null, status: 'degraded' };

mkdirSync(DIST, { recursive: true });
writeFileSync(OUT, JSON.stringify(payload) + '\n', 'utf8');

if (payload.status === 'degraded') {
    // Avertir sans faire planter le deploy : le badge affichera l'etat degraded.
    console.warn('build.json degraded : sha indisponible, timestamp seul.');
}
console.log(`build.json : ${payload.timestamp} sha=${payload.sha ?? 'indisponible'}`);
