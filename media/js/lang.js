// media/js/lang.js
let frToEn = null; // Will be loaded dynamically

async function loadTranslations() {
    try {
        const response = await fetch('/media/locales/en.json');
        if (response.ok) {
            frToEn = await response.json();
        } else {
            console.error('Failed to load translations');
        }
    } catch (e) {
        console.error('Error fetching translations', e);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const langBtn = document.getElementById('lang-toggle');
    if (!langBtn) return;

    let currentLang = localStorage.getItem('site_lang') || 'FR';

    // Load translations if not already loaded
    await loadTranslations();

    function applyLanguage(lang) {
        if (!frToEn) return; // If json failed to load

        if (lang === 'EN') {
            document.documentElement.lang = 'en';
            langBtn.textContent = 'FR';
            
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while (node = walker.nextNode()) {
                const text = node.nodeValue.trim();
                // Avoid replacing short empty texts or scripts
                if (text && node.parentElement.tagName !== 'SCRIPT' && node.parentElement.tagName !== 'STYLE') {
                    // Check direct match
                    if (frToEn[text]) {
                        node.nodeValue = node.nodeValue.replace(text, frToEn[text]);
                        // store original
                        node.parentElement.setAttribute('data-fr-original', text);
                    }
                }
            }

            // Also translate inputs placeholders
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
            
            // Restore FR original text
            const nodesWithFR = document.querySelectorAll('[data-fr-original]');
            nodesWithFR.forEach(el => {
                // Not perfect for deep nested, but works for our simple texts
                // To be completely safe, we just reload the page when switching back to FR
                // or we use a better i18n tagging system.
            });
            
            // Since tree walker replaces text nodes directly, going back is complex without full refresh
            // The cleanest way for a static site is just to reload to reset the DOM, or we force refresh.
            // But let's try to reload if going back to FR
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
            location.reload(); // Simple and robust for resetting text nodes to FR
        }
    });
});