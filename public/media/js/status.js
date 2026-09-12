// Widget de statut du footer : sonde d'image vers Uptime Kuma.
// Pas de fetch cross-origin (pas de CORS, pas d'erreur console) : l'icône
// du status page répond 200 tant que le service est joignable.
(function () {
    const KUMA_ICON = 'https://status.mayoraz-net.ch/icon.svg';

    function setStatus(color, shadow, msgKey, fallback, animation) {
        const textEl = document.getElementById('status-text');
        const indicatorEl = document.getElementById('status-indicator');
        if (!textEl || !indicatorEl) return;
        textEl.textContent = (window.t ? window.t(msgKey) : fallback);
        textEl.setAttribute('data-i18n', msgKey);
        indicatorEl.style.backgroundColor = color;
        indicatorEl.style.boxShadow = shadow;
        indicatorEl.style.animation = animation;
    }

    function checkHomelabStatus() {
        const textEl = document.getElementById('status-text');
        const indicatorEl = document.getElementById('status-indicator');
        if (!textEl || !indicatorEl) return;

        // Statut optimiste vert en attendant la sonde
        setStatus('#10B981', '0 0 10px rgba(16, 185, 129, 0.6)', 'Tous les systèmes opérationnels', 'Tous les systèmes opérationnels', 'pulse-green 2s infinite');

        const probe = new Image();
        probe.onerror = () => {
            setStatus('#EF4444', '0 0 10px rgba(239, 68, 68, 0.6)', 'Systèmes Dégradés', 'Systèmes Dégradés', 'pulse-red 2s infinite');
        };
        probe.src = KUMA_ICON + '?_=' + Date.now();
    }

    document.addEventListener('astro:page-load', () => {
        checkHomelabStatus();
        // Garde anti-stack : un seul intervalle, même après plusieurs navigations VT
        if (window.__statusTimer) clearInterval(window.__statusTimer);
        window.__statusTimer = setInterval(checkHomelabStatus, 60000);
    });
})();
