// Liste des articles (idéalement générée côté serveur, mais ici codée en dur pour GitHub Pages)
const articles = [
    { title: "Le fichier docker-compose parfait pour débuter", tag: "Docker", file: "docker.md" },
    { title: "Auto-Healing : Redémarrer un conteneur crashé", tag: "n8n", file: "n8n.md" },
    { title: "Architecture de la Stack 'Arr'", tag: "Media", file: "media.md" }
];

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('tutorials-container');
    if (!container) return;

    if (typeof marked === 'undefined') {
        container.innerHTML = '<p style="color:red; text-align:center;">Erreur: Librairie marked.js non chargée.</p>';
        return;
    }

    for (const article of articles) {
        try {
            // Création du bouton (Accordéon)
            const btn = document.createElement('button');
            btn.className = 'accordion';
            btn.innerHTML = `<span class="tag">${article.tag}</span> <span>${article.title}</span>`;
            container.appendChild(btn);

            // Création du panel
            const panel = document.createElement('div');
            panel.className = 'panel';
            panel.innerHTML = '<p>Chargement...</p>';
            container.appendChild(panel);

            // Gestionnaire de clic
            btn.addEventListener('click', async function() {
                this.classList.toggle('active');
                
                // Si on ouvre et que c'est la première fois, on charge le contenu
                if (this.classList.contains('active') && !panel.hasAttribute('data-loaded')) {
                    const response = await fetch(`/tutoriels/articles/${article.file}`);
                    if (response.ok) {
                        const mdContent = await response.text();
                        panel.innerHTML = marked.parse(mdContent);
                        panel.setAttribute('data-loaded', 'true');
                        // Réajuster la hauteur maximale du panel
                        panel.style.maxHeight = panel.scrollHeight + "px";
                    } else {
                        panel.innerHTML = '<p>Erreur lors du chargement de l\'article.</p>';
                    }
                } else if (this.classList.contains('active')) {
                    panel.style.maxHeight = panel.scrollHeight + "px";
                } else {
                    panel.style.maxHeight = null;
                }
            });

        } catch (error) {
            console.error("Erreur lors de l'initialisation de l'article", error);
        }
    }
    if (typeof updateText === 'function') updateText();
});