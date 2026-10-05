// Formulaire offre PME : envoi via fetch + redirection locale contrôlée.
// Raison d'être : la clé Web3Forms est partagée avec l'ancien formulaire de contact,
// dont le réglage de redirection dans le dashboard Web3Forms pointe vers /contact/merci.html
// (page supprimée lors de la refonte Astro, donc 404). Le champ caché "redirect" du
// formulaire est ignoré au profit de ce réglage, on gère donc la destination ici.
// La réponse de Web3Forms reste identique (mail envoyé), seule la destination navigateur change.
document.addEventListener('astro:page-load', () => {
    const form = document.getElementById('offre-pme-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const origHTML = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.style.cursor = 'not-allowed';
        }
        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: new FormData(form)
        }).then(res => res.json()).then(j => {
            if (j && j.success) {
                window.location.href = '/offre-pme/merci/';
            } else {
                alert((j && j.message) ? ('Erreur : ' + j.message) : 'Erreur lors de l\'envoi. Veuillez réessayer.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.cursor = '';
                }
            }
        }).catch(() => {
            alert('Erreur de réseau. Veuillez réessayer.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = '';
            }
        });
    });
});
