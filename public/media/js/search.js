/**
 * Recherche full-text côté client.
 *
 * - Index construit à la volée : récupère les pages listées dans /search-index.json,
 *   les parse, extrait le texte par sections (h1/h2/h3 + contenu) et le stocke.
 * - Recherche insensible aux accents et à la casse, par mots (tous requis, repli OR),
 *   avec scoring (titre > headings > texte, bonus mot exact, densité).
 * - Résultats avec extrait contextuel surligné et fil d'ariane (Accueil > Homelab > …).
 * - Résistant aux View Transitions : wiring global unique + requête annulable.
 */
(function () {
    if (window.__searchWired) return;
    window.__searchWired = true;

    const INDEX_URL = '/search-index.json';
    const MIN_CHARS = 2;

    let indexPromise = null;   // promesse de construction de l'index
    let lastQueryToken = 0;    // annulation des requêtes obsolètes

    // ---------- Construction de l'index ----------

    function fetchIndex() {
        if (!indexPromise) {
            indexPromise = fetch(INDEX_URL)
                .then(r => (r.ok ? r.json() : Promise.reject('index HTTP ' + r.status)))
                .then(async (manifest) => {
                    const entries = await Promise.all(manifest.pages.map(async (p) => {
                        try {
                            const res = await fetch(p.url);
                            if (!res.ok) return null;
                            const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
                            return extractSections(doc, p);
                        } catch (e) { return null; }
                    }));
                    return entries.flat().filter(Boolean);
                })
                .catch(err => { indexPromise = null; throw err; });
        }
        return indexPromise;
    }

    /** Découpe une page en sections navigables (titre de page + h2/h3). */
    function extractSections(doc, pageMeta) {
        doc.querySelectorAll('script, style, nav, footer, noscript').forEach(n => n.remove());
        const sections = [];
        const main = doc.querySelector('main') || doc.body;
        const pageTitle = main.querySelector('h1')?.textContent.trim() || pageMeta.title;

        const pushSection = (heading, el) => {
            const text = (el?.innerText || main.innerText || '')
                .replace(/\s+/g, ' ').trim();
            if (text.length < 40) return;
            const crumbs = [pageMeta.title];
            if (heading && heading !== pageTitle) crumbs.push(heading);
            sections.push({
                url: pageMeta.url,
                title: heading || pageTitle,
                crumbs: crumbs.join(' › '),
                kind: pageMeta.kind || 'page',
                headingText: (heading || '').toLowerCase(),
                text: text,
                textNorm: norm(text),
                titleNorm: norm(pageMeta.title + ' ' + (heading || '')),
            });
        };

        const heads = main.querySelectorAll('h2, h3');
        if (heads.length > 1) {
            heads.forEach(h => {
                let buf = '';
                let n = h.nextElementSibling;
                while (n && !/^(H2|H3)$/.test(n.tagName)) { buf += ' ' + n.innerText; n = n.nextElementSibling; }
                const wrap = document.createElement('div');
                wrap.innerText = h.textContent + ' ' + buf;
                pushSection(h.textContent.trim(), wrap);
            });
        } else {
            pushSection(pageTitle, main);
        }
        return sections;
    }

    // ---------- Normalisation & matching ----------

    function norm(s) {
        return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function highlight(textHtmlSafe, queryWords) {
        let out = textHtmlSafe;
        queryWords.forEach(w => {
            if (w.length < MIN_CHARS) return;
            const re = new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\w-]*)', 'gi');
            out = out.replace(re, '<mark>$1</mark>');
        });
        return out;
    }

    /** Extrait around la 1re occurrence, en coupant aux espaces. */
    function snippet(section, words) {
        const raw = section.text;
        let pos = -1;
        for (const w of words) {
            if (w.length < MIN_CHARS) continue;
            const i = section.textNorm.indexOf(w);
            if (i >= 0) { pos = i; break; }
        }
        if (pos === -1) pos = 0;
        const start = Math.max(0, pos - 60);
        const end = Math.min(raw.length, pos + 180);
        let frag = raw.slice(start, end).trim();
        if (start > 0) frag = '… ' + frag.slice(frag.indexOf(' ') + 1);
        if (end < raw.length) frag = frag.slice(0, frag.lastIndexOf(' ')) + ' …';
        return frag
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function scoreSection(s, words) {
        let score = 0;
        let matchedAll = true;
        for (const w of words) {
            if (w.length < MIN_CHARS) continue;
            const inTitle = s.titleNorm.includes(w);
            const inHead = s.headingText && norm(s.headingText).includes(w);
            const count = s.textNorm.split(w).length - 1;
            if (!inTitle && !inHead && count === 0) { matchedAll = false; break; }
            score += (inTitle ? 50 : 0) + (inHead ? 25 : 0) + Math.min(count, 6) * 4;
            if (s.textNorm.includes(w)) score += 10; // mot exact (pluriel/S non compté ci-dessus)
        }
        if (!matchedAll) return 0;
        return score;
    }

    function search(sections, query) {
        const words = norm(query).split(/\s+/).filter(Boolean);
        if (!words.length) return [];
        let results = sections
            .map(s => ({ s, score: scoreSection(s, words) }))
            .filter(r => r.score > 0);
        // Repli OU si tout est vide (ex. « docker compose jelyfin »)
        if (!results.length && words.length > 1) {
            results = sections
                .map(s => ({ s, score: words.reduce((a, w) => a + (s.textNorm.includes(w) || s.titleNorm.includes(w) ? 8 : 0), 0) }))
                .filter(r => r.score > 0);
        }
        // Déduplication par URL (garde le meilleur score), tri
        const byUrl = new Map();
        results.forEach(r => {
            const prev = byUrl.get(r.s.url);
            if (!prev || r.score > prev.score) byUrl.set(r.s.url, r);
        });
        return [...byUrl.values()].sort((a, b) => b.score - a.score).slice(0, 8).map(r => r.s);
    }

    // ---------- UI ----------

    function initUI() {
        const modal = document.getElementById('search-modal');
        const input = document.getElementById('search-input');
        const resultsContainer = document.getElementById('search-results');
        const backdrop = document.getElementById('search-backdrop');
        const toggleBtn = document.getElementById('search-toggle');
        if (!modal || !input || !resultsContainer) return;

        const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const t = (s) => (window.t ? window.t(s) || s : s);

        const renderStatus = (msg) => {
            resultsContainer.innerHTML = `<li class="search-status">${esc(msg)}</li>`;
        };

        const renderResults = (query, sections) => {
            const q = query.trim();
            resultsContainer.innerHTML = '';
            if (!q) {
                renderStatus(t('Tapez pour rechercher dans tout le site…'));
                return;
            }
            const words = norm(q).split(/\s+/).filter(Boolean);
            const found = search(sections, q);
            if (!found.length) {
                renderStatus(t('Aucun résultat') + ' — « ' + esc(q) + ' »');
                return;
            }
            found.forEach((s, index) => {
                const li = document.createElement('li');
                li.className = 'search-result-item' + (index === 0 ? ' active' : '');
                li.innerHTML = `
                    <a href="${s.url}">
                        <div class="res-path">${esc(s.crumbs)}</div>
                        <div class="res-title">${highlight(esc(s.title), words)}</div>
                        <div class="res-desc">${highlight(snippet(s, words), words)}</div>
                        <span class="res-enter">↵</span>
                    </a>`;
                li.addEventListener('mouseenter', () => setActive(index));
                resultsContainer.appendChild(li);
            });
        };

        let activeIndex = 0;
        function setActive(i) {
            const items = resultsContainer.querySelectorAll('.search-result-item');
            if (!items.length) return;
            items.forEach(it => it.classList.remove('active'));
            activeIndex = Math.min(Math.max(i, 0), items.length - 1);
            items[activeIndex].classList.add('active');
            items[activeIndex].scrollIntoView({ block: 'nearest' });
        }

        async function onInput() {
            const q = input.value;
            const token = ++lastQueryToken;
            try {
                const sections = await fetchIndex();
                if (token !== lastQueryToken) return; // une requête plus récente est arrivée
                renderResults(q, sections);
            } catch (e) {
                if (token === lastQueryToken) renderStatus(t('Indexation en cours… réessayez dans un instant.'));
            }
        }

        input.addEventListener('input', onInput);

        input.addEventListener('keydown', (e) => {
            const items = resultsContainer.querySelectorAll('.search-result-item');
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIndex + 1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIndex - 1); }
            else if (e.key === 'Enter') {
                e.preventDefault();
                const item = items[activeIndex];
                if (item) item.querySelector('a').click();
            }
        });

        function openModal() {
            modal.classList.add('open');
            input.value = '';
            renderStatus(t('Tapez pour rechercher dans tout le site…'));
            input.placeholder = t('Rechercher partout (ex. docker, radarr…)');
            input.focus();
        }
        function closeModal() { modal.classList.remove('open'); }

        backdrop.addEventListener('click', closeModal);
        if (toggleBtn) toggleBtn.addEventListener('click', openModal);

        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                modal.classList.contains('open') ? closeModal() : openModal();
            } else if (e.key === 'Escape' && modal.classList.contains('open')) {
                closeModal();
            }
        });

        // Préchauffe l'index en arrière-plan après chargement (expérience instantanée)
        setTimeout(() => { fetchIndex().catch(() => {}); }, 2500);

        document.addEventListener('languageChanged', () => {
            if (modal.classList.contains('open')) onInput();
        });
    }

    document.addEventListener('astro:page-load', () => {
        try { initUI(); } catch (e) { console.error('search init:', e); }
    });
})();
