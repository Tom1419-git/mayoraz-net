// Konami Code sequence: Up, Up, Down, Down, Left, Right, Left, Right, B, A
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiPosition = 0;

document.addEventListener('keydown', function(e) {
    const key = e.key;
    if (key.toLowerCase() === konamiCode[konamiPosition].toLowerCase() || key === konamiCode[konamiPosition]) {
        konamiPosition++;
        if (konamiPosition === konamiCode.length) {
            activateMatrixMode();
            konamiPosition = 0;
        }
    } else {
        konamiPosition = 0;
    }
});

function activateMatrixMode() {
    // Prevent multiple activations
    if (document.getElementById('matrix-canvas')) return;

    if (typeof showToast === 'function') {
        showToast('Wake up, Neo... 🐇', 'success');
    }

    // Force dark mode
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
    localStorage.setItem('theme', 'dark');
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.innerText = '🌙';

    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '9999';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0.4';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    
    // Make canvas full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*]*'.split('');
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = [];

    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }

    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#0F0';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(drawMatrix, 33);
}
