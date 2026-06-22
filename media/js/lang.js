// media/js/lang.js

document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.getElementById('lang-toggle');
    if (!langBtn) return;

    // Available languages
    const languages = ['FR', 'EN', 'DE'];
    let currentLang = localStorage.getItem('site_lang') || 'FR';

    function applyLanguage(lang) {
        if (lang === 'FR') {
            document.documentElement.lang = 'fr';
            langBtn.textContent = 'EN'; // Next lang to toggle
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
        
        // The button shows the NEXT language
        const nextLang = languages[(languages.indexOf(lang) + 1) % languages.length];
        langBtn.textContent = nextLang;
        
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            const text = node.nodeValue.trim();
            if (text && node.parentElement.tagName !== 'SCRIPT' && node.parentElement.tagName !== 'STYLE') {
                // If it's already translated, we need the original text
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

    if (currentLang !== 'FR') {
        applyLanguage(currentLang);
    } else {
        // Just set the button to EN
        langBtn.textContent = 'EN';
    }

    langBtn.addEventListener('click', () => {
        const nextIdx = (languages.indexOf(currentLang) + 1) % languages.length;
        currentLang = languages[nextIdx];
        localStorage.setItem('site_lang', currentLang);
        
        if (currentLang === 'FR') {
            location.reload(); // Reload to clear DOM from translations
        } else {
            applyLanguage(currentLang);
        }
    });
});