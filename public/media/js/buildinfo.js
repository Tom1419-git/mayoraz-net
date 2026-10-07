// Badge de deploy du footer : lit /build.json (genere par le pipeline CI au
// deploy) et affiche l'etat du dernier deploy plus la date de derniere mise
// a jour. Le badge reste cache si le fetch echoue ou si build.json n'existe
// pas encore : aucun bruit console, aucun blocage du rendu (fetch asynchrone).
// La date est composee en JS (Intl.DateTimeFormat) avec la langue courante du
// document, et re-rendue sur languageChanged pour suivre les bascules FR/EN.
(function () {
    const DAY_MS = 24 * 60 * 60 * 1000;
    const FRESH_DAYS = 30; // au-dela, le badge passe en "deploiement ancien"
    let timer = null;
    let lastData = null;

    function els() {
        return {
            badge: document.getElementById('deploy-badge'),
            dot: document.getElementById('deploy-indicator'),
            text: document.getElementById('deploy-text')
        };
    }

    function currentDatePart(timestamp) {
        if (typeof timestamp !== 'string') return null;
        const ts = Date.parse(timestamp);
        if (Number.isNaN(ts)) return null;
        const locale = document.documentElement.lang === 'en' ? 'en-GB' : 'fr-CH';
        return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(ts));
    }

    function composeText(state) {
        const shown = window.t ? window.t(state.labelKey) : state.labelFallback;
        const datePart = currentDatePart(lastData && lastData.timestamp);
        return datePart ? shown + ' · ' + datePart : shown;
    }

    function render(state) {
        const { badge, dot, text } = els();
        if (!badge || !dot || !text) return;
        dot.style.backgroundColor = state.color;
        dot.style.boxShadow = state.shadow;
        dot.style.animation = state.animation;
        const shown = composeText(state);
        text.textContent = shown;
        text.setAttribute('data-i18n', state.labelKey);
        text.setAttribute('title', state.title);
        badge.style.display = '';
        badge.setAttribute('aria-label', shown);
    }

    function classify(data) {
        const hasTs = typeof data.timestamp === 'string' && !Number.isNaN(Date.parse(data.timestamp));
        const hasSha = typeof data.sha === 'string' && /^[0-9a-f]{7,40}$/i.test(data.sha);
        if (data.status === 'degraded' || !hasTs || !hasSha) {
            return {
                labelKey: 'Déploiement dégradé',
                labelFallback: 'Déploiement dégradé',
                color: '#F59E0B', shadow: '0 0 10px rgba(245, 158, 11, 0.6)',
                animation: 'none',
                title: 'Date de derniere mise a jour : ' + (currentDatePart(data.timestamp) || 'inconnue')
            };
        }
        const ts = Date.parse(data.timestamp);
        const ageDays = Math.floor((Date.now() - ts) / DAY_MS);
        const iso = new Date(ts).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
        const title = 'Date de derniere mise a jour : ' + iso + ' · build ' + data.sha.slice(0, 7);
        if (ageDays > FRESH_DAYS) {
            return {
                labelKey: 'Déploiement ancien',
                labelFallback: 'Déploiement ancien',
                color: '#F97316', shadow: '0 0 10px rgba(249, 115, 22, 0.5)',
                animation: 'none',
                title: title
            };
        }
        return {
            labelKey: 'Déploiement réussi',
            labelFallback: 'Déploiement réussi',
            color: '#10B981', shadow: '0 0 10px rgba(16, 185, 129, 0.6)',
            animation: 'pulse-green 2s infinite',
            title: title
        };
    }

    async function fetchBuildInfo() {
        const { badge } = els();
        if (!badge) return;
        try {
            const res = await fetch('/build.json', { cache: 'no-store' });
            if (!res.ok) return;          // 404 (deploy antérieur au badge) ou erreur
            const ct = res.headers.get('content-type') || '';
            if (ct && !ct.includes('json')) return;
            const data = await res.json();
            if (typeof data !== 'object' || data === null || Array.isArray(data)) return;
            lastData = data;
            render(classify(data));
        } catch {
            // offline ou navigation View Transition en cours : on reste cache.
        }
    }

    document.addEventListener('astro:page-load', () => {
        // Garde anti-stack (View Transitions) : un seul fetch et un seul
        // ecouteur, meme apres plusieurs navigations.
        clearTimeout(timer);
        timer = setTimeout(fetchBuildInfo, 150);
    });

    if (!window.__buildinfoLangBound) {
        window.__buildinfoLangBound = true;
        document.addEventListener('languageChanged', () => {
            if (lastData) render(classify(lastData));
        });
    }
})();
