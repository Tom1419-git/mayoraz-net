// media/js/lang.js

document.addEventListener('astro:page-load', () => {
    const langSelects = document.querySelectorAll('.lang-select');
    if (langSelects.length === 0) return;

    let currentLang = localStorage.getItem('site_lang') || 'FR';

    function applyLanguage(lang) {
        if (lang === 'FR') {
            document.documentElement.lang = 'fr';
            // Restaurer le texte français depuis data-i18n
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = key;
                } else {
                    el.textContent = key;
                }
            });
            document.querySelectorAll('[data-i18n-html]').forEach(el => {
                const key = el.getAttribute('data-i18n-html');
                // The key itself is usually NOT the french text for data-i18n-html, 
                // but we might need a fr dictionary if we want to restore complex HTML.
                // However, since it's an edge case, we can reload if going back to FR is too complex,
                // or just rely on the user having minimal data-i18n-html
            });
            document.dispatchEvent(new Event('languageChanged'));
            return;
        }

        let dict = null;
        if (lang === 'EN') dict = typeof frToEn !== 'undefined' ? frToEn : null;
        if (lang === 'DE') dict = typeof frToDe !== 'undefined' ? frToDe : null;

        if (!dict) {
            console.error('Dictionary for ' + lang + ' is not loaded.');
            return;
        }

        document.documentElement.lang = lang.toLowerCase();

        // Appliquer les traductions via data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = dict[key];
                } else {
                    el.textContent = dict[key];
                }
            }
        });

        // Appliquer les traductions complexes via data-i18n-html
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (dict[key]) {
                el.innerHTML = dict[key];
            }
        });

        // Appliquer les traductions aria
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            if (dict[key]) {
                el.setAttribute('aria-label', dict[key]);
            }
        });

        // Appliquer les traductions placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key]) {
                el.setAttribute('placeholder', dict[key]);
            }
        });
        
        document.dispatchEvent(new Event('languageChanged'));
    }

    // Initialiser les sélecteurs
    langSelects.forEach(select => {
        select.value = currentLang;
    });

    // Appliquer la langue initiale
    if (currentLang !== 'FR') {
        applyLanguage(currentLang);
    }

    // Écouter les changements de langue
    langSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            currentLang = e.target.value;
            localStorage.setItem('site_lang', currentLang);
            
            // Appliquer la langue sans recharger la page
            if (currentLang === 'FR') {
                // Pour revenir au français original parfait avec HTML, on recharge
                location.reload(); 
            } else {
                applyLanguage(currentLang);
                if (typeof showToast === 'function') {
                    const toastText = currentLang === 'EN' ? 'Language: ' + currentLang : (currentLang === 'DE' ? 'Sprache: ' + currentLang : 'Langue : ' + currentLang);
                    showToast(toastText, 'success');
                }
            }
            
            // Sync all selects if there are multiple on the page
            langSelects.forEach(s => s.value = currentLang);
        });
    });
});