// media/js/typewriter.js
document.addEventListener('astro:page-load', () => {
    const typewriterElement = document.getElementById('typewriter');
    if (!typewriterElement) return;

    const phrasesFr = [
        "Spécialiste Infrastructure Réseau",
        "Technicien Informatique (IT)",
        "Expert Hardware & Montage PC",
        "Développeur Web & Scripting"
    ];

    const phrasesEn = [
        "Network Infrastructure Specialist",
        "IT Technician",
        "Hardware & PC Building Expert",
        "Web & Scripting Developer"
    ];

    const phrasesDe = [
        "Netzwerkinfrastruktur-Spezialist",
        "IT-Techniker",
        "Hardware- & PC-Bau-Experte",
        "Web- & Scripting-Entwickler"
    ];
    
    let currentPhraseIndex = 0;
    let isDeleting = false;
    let txt = '';
    let typeSpeed = 100;

    function type() {
        const lang = document.documentElement.lang;
        let activePhrases = phrasesFr;
        if (lang === 'en') activePhrases = phrasesEn;
        if (lang === 'de') activePhrases = phrasesDe;
        
        const fullTxt = activePhrases[currentPhraseIndex];

        if (isDeleting) {
            txt = fullTxt.substring(0, txt.length - 1);
            typeSpeed = 50; // faster when deleting
        } else {
            txt = fullTxt.substring(0, txt.length + 1);
            typeSpeed = 100; // normal typing
        }

        typewriterElement.innerHTML = `<span class="wrap">${txt}</span><span class="cursor">|</span>`;

        let delta = typeSpeed - Math.random() * 50;

        if (!isDeleting && txt === fullTxt) {
            delta = 2000; // pause at end of phrase
            isDeleting = true;
        } else if (isDeleting && txt === '') {
            isDeleting = false;
            currentPhraseIndex = (currentPhraseIndex + 1) % activePhrases.length;
            delta = 500; // pause before next phrase
        }

        setTimeout(type, delta);
    }

    // Peindre la première phrase complète immédiatement : le LCP (ce texte)
    // est verrouillé au premier frame au lieu de croître lettre par lettre.
    const lang0 = document.documentElement.lang;
    const phrases0 = lang0 === 'en' ? phrasesEn : (lang0 === 'de' ? phrasesDe : phrasesFr);
    txt = phrases0[0];
    isDeleting = true; // le cycle reprend en suppression après la pause initiale
    typewriterElement.innerHTML = `<span class="wrap">${txt}</span><span class="cursor">|</span>`;
    setTimeout(type, 2200);
});
