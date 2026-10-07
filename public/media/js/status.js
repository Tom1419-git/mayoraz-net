// Badge du footer : état du monitor « Site public (watchdog) » de Uptime Kuma.
// Sonde d'image vers l'endpoint badge SVG du monitor 69 (pas de fetch
// cross-origin JSON). L'URL du badge répond 200 tant que Kuma est joignable ;
// le fichier SVG embarque la couleur du monitor (mets = vert, down = rouge).
// Terme down via un probe Image() : un SVG traversant le tunnel CF rend de la
// géométrie (largeur 25/70) jamais nulle, et son onload ne cross ni erreur ni
// sémantique fiable : la couleur est lue en parsant le SVG chargé, avec
// longueur de réponse comme signal de secours (up 895 < down 1316 o).
(function () {
    const BADGE_URL = 'https://status.mayoraz-net.ch/api/badge/69/status?label=';
    const UP_LENGTH = 895;     // SVG "Up" en réponse 200 (o, mesuré en prod)
    const DOWN_LENGTH = 1316;  // SVG "Down" en réponse 200 (o, mesuré en prod)
    const UP_COLOR = '#10B981';
    const DOWN_COLOR = '#EF4444';
    // Couleurs de fill des badges Kuma mesurées en prod le 07/10 :
    // up = #66c20a, down = #e05d44 (shields.io). On teste un préfixe
    // robuste aux variations plutôt qu'une valeur exacte.

    function setStatus(color, shadow, msgKey, fallback, animation) {
        // Conservé pour compat potentielles références externes : délègue à applyKumaState
        applyKumaState(color === UP_COLOR, '');
    }

    function applyKumaState(isUp, help) {
        const textEl = document.getElementById('status-text');
        const indicatorEl = document.getElementById('status-indicator');
        if (!textEl || !indicatorEl) return;
        const color = isUp ? UP_COLOR : DOWN_COLOR;
        const shadow = isUp
            ? '0 0 10px rgba(16, 185, 129, 0.6)'
            : '0 0 10px rgba(239, 68, 68, 0.6)';
        const anim = isUp ? 'pulse-green 2s infinite' : 'pulse-red 2s infinite';
        const msgKey = isUp ? 'Site en ligne' : 'Site indisponible';
        const fallback = isUp ? 'Site en ligne' : 'Site indisponible';
        textEl.textContent = (window.t ? window.t(msgKey) : fallback);
        textEl.setAttribute('data-i18n', msgKey);
        textEl.title = ((isUp ? 'Monitor Kuma « Site public (watchdog) » : UP '
            : 'Monitor Kuma « Site public (watchdog) » : DOWN ') + help).trim();
        indicatorEl.style.backgroundColor = color;
        indicatorEl.style.boxShadow = shadow;
        indicatorEl.style.animation = anim;
    }

    function checkHomelabStatus() {
        // Badge optimiste vert en attendant la sonde du monitor Kuma 69
        applyKumaState(true, '');

        // Sonde réelle : le status SVG du monitor 69 (badge de Kuma).
        // La couleur est lue en parsant le SVG (fill du rect central), avec
        // la longueur de réponse comme secours si la couleur échappe au DOM.
        const probe = new Image();
        probe.onload = () => {
            fetch(BADGE_URL + '&_=' + Date.now(), { cache: 'no-store' })
                .then(r => r.text())
                .then(svgText => {
                    let isUp = svgText.length < 1100; // 895 Up vs 1316 Down mesurés
                    try {
                        const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
                        const rects = doc.querySelectorAll('rect[fill]');
                        // Le rect central porte la couleur d'état (#66c20a up,
                        // #e05d44 down) ; ignorer le fond #fff et le dégradé.
                        for (const r of rects) {
                            const fill = (r.getAttribute('fill') || '').toLowerCase();
                            if (fill === '#66c20a' || fill.startsWith('#6')) { isUp = true; break; }
                            if (fill === '#e05d44' || fill.startsWith('#e0')) { isUp = false; break; }
                        }
                    } catch (e) { /* fallback longueur */ }
                    applyKumaState(isUp, 'SVG ' + svgText.length + ' o');
                })
                .catch(() => applyKumaState(true, 'SVG illisible, état optimiste'));
        };
        probe.onerror = () => {
            applyKumaState(false, 'Kuma injoignable via le tunnel public');
        };
        probe.src = BADGE_URL + '&_=' + Date.now();
    }

    document.addEventListener('astro:page-load', () => {
        checkHomelabStatus();
        // Garde anti-stack : un seul intervalle, même après plusieurs navigations VT
        if (window.__statusTimer) clearInterval(window.__statusTimer);
        window.__statusTimer = setInterval(checkHomelabStatus, 60000);
    });
})();
