document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');
    const backdrop = document.getElementById('search-backdrop');
    const toggleBtn = document.getElementById('search-toggle');

    if (!modal || !input) return;

    // predefined static pages for search
    const pages = [
        { title: "Accueil", url: "/", desc: "Page principale", tags: "home accueil" },
        { title: "À propos", url: "/a-propos/", desc: "Mon parcours et mes compétences", tags: "about cv compétences" },
        { title: "Mes Sites Web", url: "/sites-web/", desc: "Mes créations digitales", tags: "projets web portfolio" },
        { title: "Projets C#", url: "/projets-csharp/", desc: "Mes développements C#", tags: "c# dev console mastermind puissance4" },
        { title: "Montage PC", url: "/builds-pc/", desc: "Configurations et setups", tags: "pc hardware setup gaming" },
        { title: "Homelab & Serveur", url: "/homelab/", desc: "Infrastructure et Docker", tags: "serveur infra docker n8n proxmox" },
        { title: "Tutoriels", url: "/tutoriels/", desc: "Snippets et astuces techniques", tags: "tuto astuces snippets docker" },
        { title: "Contact", url: "/contact/", desc: "Me contacter pour un projet", tags: "contact email" },
        { title: "Quiz Informatique", url: "/jeu/", desc: "Testez vos connaissances IT", tags: "jeu quiz tech" },
        { title: "Jeu T-Rex (Admin Run)", url: "/jeu-trex/", desc: "Jeu de saut Easter Egg", tags: "jeu trex easter egg" }
    ];

    let activeIndex = -1;
    let currentResults = [];

    function openModal() {
        modal.classList.add('open');
        input.value = '';
        input.focus();
        renderResults('');
    }

    function closeModal() {
        modal.classList.remove('open');
    }

    function renderResults(query) {
        const q = query.toLowerCase().trim();
        if (q === '') {
            currentResults = pages;
        } else {
            currentResults = pages.filter(p => 
                p.title.toLowerCase().includes(q) || 
                p.desc.toLowerCase().includes(q) || 
                p.tags.includes(q)
            );
        }

        resultsContainer.innerHTML = '';
        activeIndex = 0; // Select first result by default

        if (currentResults.length === 0) {
            let emptyMsg = "Aucun résultat";
            if (window.t) {
                emptyMsg = window.t("Aucun résultat") || "No results found";
            }
            resultsContainer.innerHTML = `<li class="no-results">${emptyMsg}</li>`;
            return;
        }

        currentResults.forEach((page, index) => {
            const li = document.createElement('li');
            li.className = 'search-result-item' + (index === 0 ? ' active' : '');
            
            // support i18n dynamic translation for titles
            const displayTitle = window.t ? window.t(page.title) : page.title;
            const displayDesc = window.t ? window.t(page.desc) : page.desc;

            li.innerHTML = `
                <a href="${page.url}">
                    <div class="res-title">${displayTitle}</div>
                    <div class="res-desc">${displayDesc}</div>
                    <span class="res-enter">↵</span>
                </a>
            `;
            
            li.addEventListener('mouseenter', () => {
                setActiveIndex(index);
            });

            resultsContainer.appendChild(li);
        });
    }

    function setActiveIndex(index) {
        const items = resultsContainer.querySelectorAll('.search-result-item');
        if (items.length === 0) return;
        
        items.forEach(item => item.classList.remove('active'));
        if (index >= 0 && index < items.length) {
            activeIndex = index;
            items[index].classList.add('active');
            items[index].scrollIntoView({ block: 'nearest' });
        }
    }

    input.addEventListener('input', (e) => {
        renderResults(e.target.value);
    });

    input.addEventListener('keydown', (e) => {
        const items = resultsContainer.querySelectorAll('.search-result-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (activeIndex < items.length - 1) setActiveIndex(activeIndex + 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (activeIndex > 0) setActiveIndex(activeIndex - 1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < currentResults.length) {
                window.location.href = currentResults[activeIndex].url;
            }
        }
    });

    backdrop.addEventListener('click', closeModal);
    if(toggleBtn) toggleBtn.addEventListener('click', openModal);

    // Global Keybind Cmd+K or Ctrl+K
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            if (modal.classList.contains('open')) {
                closeModal();
            } else {
                openModal();
            }
        }
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });

    // Handle i18n dynamically if language changes while modal is open
    document.addEventListener('languageChanged', () => {
        if (modal.classList.contains('open')) {
            renderResults(input.value);
            input.placeholder = window.t ? window.t("Rechercher (Projets, Contact, Homelab...)") : "Rechercher (Projets, Contact, Homelab...)";
        }
    });
});
