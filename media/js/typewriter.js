// media/js/typewriter.js
document.addEventListener('DOMContentLoaded', () => {
    const typewriterElement = document.getElementById('typewriter');
    if (!typewriterElement) return;

    const phrases = [
        "Spécialiste Infrastructure Réseau",
        "Technicien Informatique (IT)",
        "Expert Hardware & Montage PC",
        "Développeur Web & Scripting"
    ];
    
    let currentPhraseIndex = 0;
    let isDeleting = false;
    let txt = '';
    let typeSpeed = 100;

    function type() {
        const fullTxt = phrases[currentPhraseIndex];

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
            currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
            delta = 500; // pause before next phrase
        }

        setTimeout(type, delta);
    }

    type();
});
