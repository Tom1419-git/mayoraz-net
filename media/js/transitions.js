document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in animation to body on load
    document.body.classList.add('fade-in');

    document.querySelectorAll('a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Ignorer si pas de lien
            if (!href) return;

            // Ignorer les liens externes, les ancres, mailto, tel, ou les nouveaux onglets
            if (
                href.startsWith('http') && !href.includes(window.location.host) ||
                href.startsWith('#') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                this.getAttribute('target') === '_blank' ||
                e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0 ||
                this.hasAttribute('download')
            ) {
                return;
            }

            // Ignorer si on est déjà sur la page exacte
            if (href === window.location.pathname || href === window.location.pathname + '/') {
                return;
            }

            e.preventDefault();
            const destination = this.href;
            
            // Appliquer l'effet de fade out
            document.body.classList.add('fade-out');

            // Rediriger ultra rapidement (150ms)
            setTimeout(() => {
                window.location.href = destination;
            }, 150);
        });
    });
});

// Gérer le retour arrière du navigateur (BFCache)
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        document.body.classList.remove('fade-out');
    }
});