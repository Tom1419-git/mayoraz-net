// media/js/toast.js

document.addEventListener('astro:page-load', () => {
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

    const lang = document.documentElement.lang;
    let cookieText = "> Nous utilisons le stockage local (LocalStorage) pour sauvegarder vos préférences et des cookies pour les statistiques de visite anonymes (Microsoft Clarity). Acceptez-vous ?";
    let acceptText = "[Y] Accepter";
    let declineText = "[N] Refuser";
    let successToast = "Préférences enregistrées avec succès.";
    let warningToast = "Vous avez refusé. Certaines fonctionnalités (thème, quiz) pourraient ne pas être sauvegardées.";

    if (lang === 'en') {
        cookieText = "> We use local storage (LocalStorage) to save your preferences and cookies for anonymous visitor statistics (Microsoft Clarity). Do you accept?";
        acceptText = "[Y] Accept";
        declineText = "[N] Decline";
        successToast = "Preferences saved successfully.";
        warningToast = "You declined. Some features (theme, quiz) might not be saved.";
    } else if (lang === 'de') {
        cookieText = "> Wir verwenden den lokalen Speicher (LocalStorage) zum Speichern Ihrer Einstellungen und Cookies für anonyme Besucherstatistiken (Microsoft Clarity). Akzeptieren Sie?";
        acceptText = "[Y] Akzeptieren";
        declineText = "[N] Ablehnen";
        successToast = "Einstellungen erfolgreich gespeichert.";
        warningToast = "Sie haben abgelehnt. Einige Funktionen (Theme, Quiz) werden möglicherweise nicht gespeichert.";
    }

    // Inject Cookie Banner
    const cookieHtml = `
        <div id="cookie-banner">
            <div class="cookie-content">
                <span class="cookie-prompt">root@mayoraz-net:~#</span>
                <span id="cookie-text">./check_cookies.sh --rgpd<br>${cookieText}</span>
            </div>
            <div class="cookie-actions">
                <button class="cookie-btn" id="cookie-accept">${acceptText}</button>
                <button class="cookie-btn decline" id="cookie-decline">${declineText}</button>
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
        if(typeof window.initClarity === 'function') {
            window.initClarity();
        }
        showToast(successToast, "success");
    });

    document.getElementById('cookie-decline').addEventListener('click', () => {
        cookieBanner.classList.remove('show');
        showToast(warningToast, "warning");
    });
    
    document.addEventListener('languageChanged', () => {
        const newLang = document.documentElement.lang;
        const bannerText = document.getElementById('cookie-text');
        const btnAcc = document.getElementById('cookie-accept');
        const btnDec = document.getElementById('cookie-decline');
        
        if (!bannerText) return;

        if (newLang === 'en') {
            bannerText.innerHTML = "./check_cookies.sh --rgpd<br>> We use local storage (LocalStorage) to save your preferences and cookies for anonymous visitor statistics (Microsoft Clarity). Do you accept?";
            btnAcc.textContent = "[Y] Accept";
            btnDec.textContent = "[N] Decline";
        } else if (newLang === 'de') {
            bannerText.innerHTML = "./check_cookies.sh --rgpd<br>> Wir verwenden den lokalen Speicher (LocalStorage) zum Speichern Ihrer Einstellungen und Cookies für anonyme Besucherstatistiken (Microsoft Clarity). Akzeptieren Sie?";
            btnAcc.textContent = "[Y] Akzeptieren";
            btnDec.textContent = "[N] Ablehnen";
        } else {
            bannerText.innerHTML = "./check_cookies.sh --rgpd<br>> Nous utilisons le stockage local (LocalStorage) pour sauvegarder vos préférences et des cookies pour les statistiques de visite anonymes (Microsoft Clarity). Acceptez-vous ?";
            btnAcc.textContent = "[Y] Accepter";
            btnDec.textContent = "[N] Refuser";
        }
    });
});
