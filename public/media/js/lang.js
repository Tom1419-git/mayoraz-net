// media/js/lang.js

document.addEventListener('astro:page-load', () => {
    const langSelects = document.querySelectorAll('.lang-select');
    if (langSelects.length === 0) return;

    // --- Auto-detect browser language for first-time visitors ---
    function detectBrowserLang() {
        const saved = localStorage.getItem('site_lang');
        if (saved) return saved;

        const nav = (navigator.language || navigator.userLanguage || 'fr').toLowerCase();
        if (nav.startsWith('en')) return 'EN';
        return 'FR'; // default
    }

    let currentLang = detectBrowserLang();
    // Persist immediately so next page load is consistent
    if (!localStorage.getItem('site_lang')) {
        localStorage.setItem('site_lang', currentLang);
    }

    // --- window.t() helper — used by quiz and dynamic JS ---
    window.t = function(key) {
        if (!key) return key;
        if (currentLang === 'EN' && typeof frToEn !== 'undefined' && frToEn[key]) return frToEn[key];
        return key; // fallback to French (the key itself)
    };

    function applyLanguage(lang) {
        currentLang = lang;
        window.t = function(key) {
            if (!key) return key;
            if (lang === 'EN' && typeof frToEn !== 'undefined' && frToEn[key]) return frToEn[key];
            return key;
        };

        if (lang === 'FR') {
            document.documentElement.lang = 'fr';
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = key;
                } else {
                    el.textContent = key;
                }
            });
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                el.placeholder = el.getAttribute('data-i18n-placeholder');
            });
            document.querySelectorAll('[data-i18n-aria]').forEach(el => {
                el.setAttribute('aria-label', el.getAttribute('data-i18n-aria'));
            });
            document.dispatchEvent(new Event('languageChanged'));
            return;
        }

        let dict = null;
        if (lang === 'EN') dict = typeof frToEn !== 'undefined' ? frToEn : null;

        if (!dict) {
            console.error('Dictionary for ' + lang + ' is not loaded.');
            return;
        }

        document.documentElement.lang = lang.toLowerCase();

        // Textes simples
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = dict[key];
            if (val) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = val;
                } else {
                    el.textContent = val;
                }
            }
        });

        // HTML complexe
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (dict[key]) el.innerHTML = dict[key];
        });

        // ARIA labels
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            if (dict[key]) el.setAttribute('aria-label', dict[key]);
        });

        // Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key]) el.setAttribute('placeholder', dict[key]);
        });

        document.dispatchEvent(new Event('languageChanged'));
    }

    // Initialiser les sélecteurs
    langSelects.forEach(select => {
        select.value = currentLang;
    });

    // Appliquer la langue détectée/sauvegardée
    applyLanguage(currentLang);

    // Écouter les changements manuels de langue
    langSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            currentLang = e.target.value;
            localStorage.setItem('site_lang', currentLang);

            if (currentLang === 'FR') {
                // Recharger pour restaurer parfaitement le HTML français
                location.reload();
            } else {
                applyLanguage(currentLang);
                if (typeof showToast === 'function') {
                    showToast('Language: English 🇬🇧', 'success');
                }
            }

            // Sync tous les sélecteurs (si plusieurs sur la page)
            langSelects.forEach(s => s.value = currentLang);
        });
    });
});