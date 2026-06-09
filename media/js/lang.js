// media/js/lang.js

const frToEn = {
    "Accueil": "Home",
    "À propos": "About",
    "Contact": "Contact",
    "Mes Projets": "My Projects",
    "Projets Réseaux": "Network Projects",
    "Projets Dev": "Dev Projects",
    "Mes Compétences": "My Skills",
    "Voir le projet": "View project",
    "En savoir plus": "Learn more",
    "Plan du site": "Sitemap",
    "Suivant": "Next",
    "Recommencer le quiz": "Restart quiz",
    "Voir les résultats": "View results",
    "Afficher les réponses": "Show answers",
    "Toutes les réponses": "All answers",
    "Classement du Jour": "Daily Leaderboard",
    "Rang": "Rank",
    "Score": "Score",
    "Pseudo": "Nickname",
    "Commencer le Quiz": "Start Quiz",
    "Entrez votre pseudo...": "Enter your nickname...",
    "Envoyer": "Send",
    "Votre Nom": "Your Name",
    "Votre Message": "Your Message",
    "Veuillez entrer un pseudo d'au moins 2 caractères": "Please enter a nickname of at least 2 characters",
    "Préférences enregistrées avec succès.": "Preferences saved successfully.",
    "Vous avez refusé. Certaines fonctionnalités pourraient ne pas être sauvegardées.": "You declined. Some features might not be saved.",
    "Oups, page introuvable...": "Oops, page not found...",
    "Avez-vous essayé de l'éteindre et de la rallumer ? 💡": "Have you tried turning it off and on again? 💡",
    "← Retour à l'accueil": "← Back to home"
};

const enToFr = {};
for (const [fr, en] of Object.entries(frToEn)) {
    enToFr[en] = fr;
}

let currentLang = localStorage.getItem('site_lang') || 'FR';

function translateTextNode(node, dict) {
    const text = node.nodeValue.trim();
    // Allow matching exact strings or strings with slight padding
    if (text && dict[text]) {
        node.nodeValue = node.nodeValue.replace(text, dict[text]);
    }
}

function applyLanguage(targetLang) {
    const isToEn = targetLang === 'EN';
    const activeDict = isToEn ? frToEn : enToFr;

    // Walk all text nodes in the body
    const walk = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    const nodesToTranslate = [];
    while ((node = walk.nextNode())) {
        // Skip script and style tags
        if (node.parentElement && (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE')) {
            continue;
        }
        nodesToTranslate.push(node);
    }

    nodesToTranslate.forEach(n => translateTextNode(n, activeDict));

    // Translate Placeholders
    const placeholders = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    placeholders.forEach(inp => {
        const text = inp.getAttribute('placeholder');
        if (text && activeDict[text]) {
            inp.setAttribute('placeholder', activeDict[text]);
        }
    });

    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.textContent = targetLang === 'EN' ? 'FR' : 'EN';
    }
    
    document.documentElement.lang = targetLang.toLowerCase();
}

document.addEventListener('DOMContentLoaded', () => {
    // Apply initial language without toast
    if (currentLang === 'EN') {
        applyLanguage('EN');
    }

    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            currentLang = currentLang === 'FR' ? 'EN' : 'FR';
            localStorage.setItem('site_lang', currentLang);
            
            // Apply language
            applyLanguage(currentLang);
            
            if (typeof showToast === 'function') {
                showToast(currentLang === 'EN' ? 'Language switched to English 🌍' : 'Langue changée en Français 🌍', 'info');
            }
        });
    }
});
