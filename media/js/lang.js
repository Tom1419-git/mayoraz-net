// media/js/lang.js

document.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('lang-select');
    if (!langSelect) return;

    let currentLang = localStorage.getItem('site_lang') || 'FR';

    function applyLanguage(lang) {
        if (lang === 'FR') {
            document.documentElement.lang = 'fr';
            return; // Original text is in HTML
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
            // Don't translate options inside select
            if (text && node.parentElement.tagName !== 'SCRIPT' && node.parentElement.tagName !== 'STYLE' && node.parentElement.tagName !== 'OPTION') {
                let origText = node.parentElement.getAttribute('data-fr-original') || text;
                
                if (dict[origText]) {
                    if (!node.parentElement.hasAttribute('data-fr-original')) {
                        node.parentElement.setAttribute('data-fr-original', origText);
                    }
                    node.nodeValue = node.nodeValue.replace(text, dict[origText]);
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
    }

    // Set correct option in select
    langSelect.value = currentLang;

    if (currentLang !== 'FR') {
        applyLanguage(currentLang);
    }

    langSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        localStorage.setItem('site_lang', currentLang);
        
        if (currentLang === 'FR') {
            location.reload(); 
        } else {
            // Because translating over an already translated DOM without full reload 
            // might miss things or double translate, it's safer to just reload on any language change.
            // But if they change, we just reload the page and let the initialization handle it.
            location.reload();
        }
    });
});