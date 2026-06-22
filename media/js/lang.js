// media/js/lang.js

document.addEventListener('DOMContentLoaded', () => {
    const langSelects = document.querySelectorAll('.lang-select');
    if (langSelects.length === 0) return;

    let currentLang = localStorage.getItem('site_lang') || 'FR';

    function applyLanguage(lang) {
        if (lang === 'FR') {
            document.documentElement.lang = 'fr';
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
        
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            const text = node.nodeValue.trim();
            if (text && node.parentElement.tagName !== 'SCRIPT' && node.parentElement.tagName !== 'STYLE' && node.parentElement.tagName !== 'OPTION') {
                let origText = node.parentElement.getAttribute('data-fr-original') || text;
                
                if (dict[origText]) {
                    if (!node.parentElement.hasAttribute('data-fr-original')) {
                        node.parentElement.setAttribute('data-fr-original', origText);
                    }
                    node.nodeValue = node.nodeValue.replace(text, dict[origText]);
                } else if (lang === 'DE' && typeof frToEn !== 'undefined' && frToEn[origText]) {
                    // Fallback to English if German is missing
                }
            }
        }

        const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
        inputs.forEach(input => {
            let origText = input.getAttribute('data-fr-placeholder') || input.placeholder.trim();
            if (dict[origText]) {
                if (!input.hasAttribute('data-fr-placeholder')) {
                    input.setAttribute('data-fr-placeholder', origText);
                }
                input.placeholder = dict[origText];
            }
        });
        
        document.dispatchEvent(new Event('languageChanged'));
    }

    // Initialize select values
    langSelects.forEach(select => {
        select.value = currentLang;
    });

    if (currentLang !== 'FR') {
        applyLanguage(currentLang);
    }

    langSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            currentLang = e.target.value;
            localStorage.setItem('site_lang', currentLang);
            
            // Sync all selects
            langSelects.forEach(s => { s.value = currentLang; });

            if (currentLang === 'FR') {
                location.reload(); 
            } else {
                applyLanguage(currentLang);
                if (typeof showToast === 'function') {
                    showToast('Langue changée : ' + currentLang, 'success');
                }
            }
        });
    });
});