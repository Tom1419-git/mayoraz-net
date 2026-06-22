// media/js/lang.js

document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.getElementById('lang-toggle');
    if (!langBtn) return;

    let currentLang = localStorage.getItem('site_lang') || 'FR';

    function applyLanguage(lang) {
        if (typeof frToEn === 'undefined') {
            console.error('frToEn dictionary is not loaded.');
            return;
        }

        if (lang === 'EN') {
            document.documentElement.lang = 'en';
            langBtn.textContent = 'FR';
            
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while (node = walker.nextNode()) {
                const text = node.nodeValue.trim();
                if (text && node.parentElement.tagName !== 'SCRIPT' && node.parentElement.tagName !== 'STYLE') {
                    if (frToEn[text]) {
                        node.nodeValue = node.nodeValue.replace(text, frToEn[text]);
                        node.parentElement.setAttribute('data-fr-original', text);
                    }
                }
            }

            const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
            inputs.forEach(input => {
                const text = input.placeholder.trim();
                if (frToEn[text]) {
                    input.setAttribute('data-fr-placeholder', text);
                    input.placeholder = frToEn[text];
                }
            });

        } else {
            document.documentElement.lang = 'fr';
            langBtn.textContent = 'EN';
            
            if (localStorage.getItem('site_lang') === 'EN') {
                 location.reload();
            }
        }
    }

    if (currentLang === 'EN') {
        applyLanguage('EN');
    }

    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'FR' ? 'EN' : 'FR';
        localStorage.setItem('site_lang', currentLang);
        if (currentLang === 'EN') {
            applyLanguage('EN');
        } else {
            location.reload();
        }
    });
});