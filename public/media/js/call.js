// Boutons d'appel : le numéro n'est jamais écrit en clair dans le HTML.
// Chaque lien porte data-call = son numéro encodé en base64 ; le href tel: est
// posé ici, au chargement. mm-tracker.js compte alors le clic tout seul.
// Ce sont des <a> et non des <button> : iOS Safari rend les boutons avec son
// style natif (fond blanc, bordure grise) et ignore une partie du CSS.
(function () {
    const wire = () => {
        document.querySelectorAll('[data-call]').forEach(el => {
            if (el.getAttribute('href')) return;
            el.setAttribute('href', 'tel:' + atob(el.dataset.call));
        });
    };

    document.addEventListener('astro:page-load', wire);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wire);
    } else {
        wire();
    }
})();
