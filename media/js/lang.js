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

        // Create a cleaned dictionary that maps both the exact key and a stripped key
        // (without leading emojis or symbols) to the translation.
        let cleanedDict = {};
        for (let key in dict) {
            let cleanKey = key.replace(/^[^a-zA-ZÀ-ÿ0-9(]+/g, '').trim();
            cleanedDict[key.trim()] = dict[key];
            if (cleanKey) {
                cleanedDict[cleanKey] = dict[key];
            }
        }

        document.documentElement.lang = lang.toLowerCase();
        
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            const text = node.nodeValue.trim();
            if (text && node.parentElement.tagName !== 'SCRIPT' && node.parentElement.tagName !== 'STYLE' && node.parentElement.tagName !== 'OPTION') {
                if (cleanedDict[text]) {
                    node.nodeValue = node.nodeValue.replace(text, cleanedDict[text]);
                } else {
                    let cleanText = text.replace(/^[^a-zA-ZÀ-ÿ0-9(]+/g, '').trim();
                    if (cleanText && cleanedDict[cleanText]) {
                        // Replace only the text part, keeping emojis if they are in the text node
                        node.nodeValue = node.nodeValue.replace(cleanText, cleanedDict[cleanText].replace(/^[^a-zA-ZÀ-ÿ0-9(]+/g, '').trim());
                    }
                }
            }
        }

        const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
        inputs.forEach(input => {
            const text = input.placeholder.trim();
            if (cleanedDict[text]) {
                input.placeholder = cleanedDict[text];
            } else {
                let cleanText = text.replace(/^[^a-zA-ZÀ-ÿ0-9(]+/g, '').trim();
                if (cleanText && cleanedDict[cleanText]) {
                    input.placeholder = cleanedDict[cleanText].replace(/^[^a-zA-ZÀ-ÿ0-9(]+/g, '').trim();
                }
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

    if (localStorage.getItem('lang_just_changed') === 'true') {
        if (typeof showToast === 'function') {
            showToast('Langue : ' + currentLang, 'success');
        }
        localStorage.removeItem('lang_just_changed');
    }

    langSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            currentLang = e.target.value;
            localStorage.setItem('site_lang', currentLang);
            localStorage.setItem('lang_just_changed', 'true');
            location.reload(); 
        });
    });
});