// media/js/toast.js

document.addEventListener('DOMContentLoaded', () => {
    // Inject the toast container into the body
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);

    // Global function to show toasts
    window.showToast = function(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        toast.innerHTML = `
            ${message}
            <div class="toast-progress">
                <div class="toast-progress-bar" style="animation-duration: ${duration}ms"></div>
            </div>
        `;
        
        document.getElementById('toast-container').appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400); // Wait for transition
        }, duration);
    };

    // Inject Cookie Banner
    const cookieHtml = `
        <div id="cookie-banner">
            <div class="cookie-content">
                <span class="cookie-prompt">root@mayoraz-net:~#</span>
                <span>./check_cookies.sh --rgpd<br>> Nous utilisons le stockage local (LocalStorage) uniquement pour sauvegarder vos préférences (thème, langue, pseudo). Acceptez-vous ?</span>
            </div>
            <div class="cookie-actions">
                <button class="cookie-btn" id="cookie-accept">[Y] Accepter</button>
                <button class="cookie-btn decline" id="cookie-decline">[N] Refuser</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', cookieHtml);

    const cookieBanner = document.getElementById('cookie-banner');
    
    if (!localStorage.getItem('cookies_accepted')) {
        setTimeout(() => cookieBanner.classList.add('show'), 1500);
    }

    document.getElementById('cookie-accept').addEventListener('click', () => {
        localStorage.setItem('cookies_accepted', 'true');
        cookieBanner.classList.remove('show');
        showToast("Préférences enregistrées avec succès.", "success");
    });

    document.getElementById('cookie-decline').addEventListener('click', () => {
        cookieBanner.classList.remove('show');
        showToast("Vous avez refusé. Certaines fonctionnalités (thème, quiz) pourraient ne pas être sauvegardées.", "warning");
    });
});
