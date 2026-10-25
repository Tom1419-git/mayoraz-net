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
});
