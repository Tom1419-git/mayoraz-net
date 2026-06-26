// media/js/theme.js

document.addEventListener('astro:page-load', () => {
    // 1. Dark/Light Theme Logic
    const themeToggle = document.getElementById('theme-toggle');
    let currentTheme = localStorage.getItem('theme');

    // Auto-detect system theme for first-time visitors (default = dark)
    if (!currentTheme) {
        // Check system preference; if light, apply light. Otherwise default dark.
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            currentTheme = 'light';
        } else {
            currentTheme = 'dark';
        }
        localStorage.setItem('theme', currentTheme);
    }

    document.documentElement.setAttribute('data-theme', currentTheme);
    if (themeToggle) {
        themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    }

    // Initial Grafana sync
    document.querySelectorAll('iframe').forEach(iframe => {
        if (iframe.src.includes('grafana') && iframe.src.includes('theme=')) {
            iframe.src = iframe.src.replace(/theme=[^&]+/, 'theme=' + currentTheme);
        }
    });

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            let newTheme = theme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';

            if (typeof showToast === 'function') {
                const baseMsg = newTheme === 'light' ? 'Thème clair activé' : 'Thème sombre activé';
                const msg = typeof window.t === 'function' ? window.t(baseMsg) : baseMsg;
                showToast(msg, 'success');
            }

            // Sync Grafana iframes
            document.querySelectorAll('iframe').forEach(iframe => {
                if (iframe.src.includes('grafana') && iframe.src.includes('theme=')) {
                    iframe.src = iframe.src.replace(/theme=[^&]+/, 'theme=' + newTheme);
                }
            });
        });
    }

    // Active Navigation Link
    document.querySelectorAll('.main-nav a').forEach(link => {
        // Supprimer la classe active de tous les liens
        link.classList.remove('active');
        // Ajouter la classe active si l'URL correspond (en gérant les trailing slashes)
        if (link.href === window.location.href || link.href === window.location.href + '/') {
            link.classList.add('active');
        }
    });

    // 2. Scroll Reveal Animations
    const reveals = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        root: null,
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: "0px 0px -50px 0px"
    });

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });

    // 3. Skill Bars Animation
    const skillBars = document.querySelectorAll('.skill-progress');
    const skillObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                bar.style.width = bar.getAttribute('data-width');
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => {
        skillObserver.observe(bar);
    });

    // 4. Mobile Navigation Menu (Burger)
    const burger = document.getElementById('burger');
    const navLinks = document.getElementById('nav-links');
    const navOverlay = document.getElementById('nav-overlay');

    if (burger && navLinks && navOverlay) {
        function toggleMenu() {
            burger.classList.toggle('active');
            navLinks.classList.toggle('active');
            navOverlay.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        }

        burger.addEventListener('click', toggleMenu);
        navOverlay.addEventListener('click', toggleMenu);
        
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                navLinks.classList.remove('active');
                navOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }

    // 5. Back to Top Button
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            backToTopBtn.style.display = window.scrollY > 500 ? 'flex' : 'none';
        });
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 6. Active Nav Link Highlight
    document.querySelectorAll('.main-nav a').forEach(link => {
        // Match link href with current URL path, stripping host/trailing slash for robust comparison
        const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, "");
        const currentPath = window.location.pathname.replace(/\/$/, "");
        
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });

    // 7. Page Loader Fade-Out
    const loader = document.getElementById('loader');
    if (loader) {
        const fadeOutLoader = () => {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 300);
            }, 500);
        };
        
        if (document.readyState === 'complete') {
            fadeOutLoader();
        } else {
            window.addEventListener('load', fadeOutLoader);
        }
    }
});

// Widget de Statut Uptime Kuma Global
document.addEventListener('astro:page-load', () => {
    async function updateStatus() {
        let indicator = document.getElementById('status-indicator');
        let text = document.getElementById('status-text');
        
        if (!indicator || !text) return; // Si le widget n'est pas sur la page, on ignore
        
        // Optimistic default
        indicator.style.backgroundColor = '#2ecc71';
        indicator.style.boxShadow = '0 0 10px #2ecc71';
        const okMsg = typeof window.t === 'function' ? window.t('Tous les systèmes opérationnels') : 'Tous les systèmes opérationnels';
        text.textContent = okMsg;
        text.setAttribute('data-i18n', 'Tous les systèmes opérationnels');
        
        if (typeof document.dispatchEvent === 'function') {
           
        }

        try {
          let res = await fetch('/api/status-kuma/home');
          if(res.ok) {
            let data = await res.json();
            if(data.incident !== null) {
              indicator.style.backgroundColor = '#f39c12';
              indicator.style.boxShadow = '0 0 10px #f39c12';
              const incMsg = typeof window.t === 'function' ? window.t('Incident en cours...') : 'Incident en cours...';
              text.textContent = incMsg;
              text.setAttribute('data-i18n', 'Incident en cours...');
              
            }
          }
        } catch(e) {
          console.log("Widget status: Fallback sur statut optimiste.");
        }
    }
    updateStatus();
    setInterval(updateStatus, 60000);
});

// Copier l'email au clic tout en gardant l'ouverture de l'app de messagerie
document.addEventListener('astro:page-load', () => {
    document.querySelectorAll('a[href^="mailto:"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const email = this.getAttribute('href').replace('mailto:', '');
            navigator.clipboard.writeText(email).then(() => {
                if (typeof showToast === 'function') {
                    let msg = document.documentElement.lang === 'en' ? 'Email copied to clipboard!' : (document.documentElement.lang === 'de' ? 'E-Mail in die Zwischenablage kopiert!' : 'Email copié dans le presse-papier !');
                    showToast(msg, 'success');
                }
            });
            // On ne fait pas e.preventDefault() pour que l'app mail s'ouvre normalement !
        });
    });
});