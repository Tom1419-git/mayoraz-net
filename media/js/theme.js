// media/js/theme.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Dark/Light Theme Logic
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    // Default to dark theme if no preference is saved
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (themeToggle) {
            themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            let newTheme = theme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
        });
    }

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
