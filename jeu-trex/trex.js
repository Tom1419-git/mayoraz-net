
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('current-score');
const highScoreEl = document.getElementById('high-score');
const finalScoreEl = document.getElementById('final-score');
const startOverlay = document.getElementById('start-overlay');
const gameOverOverlay = document.getElementById('game-over-overlay');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Game constants
const GRAVITY = 0.6;
const JUMP_POWER = -11;
let INITIAL_SPEED = 4;

// Variables
let animationId;
let gameRunning = false;
let score = 0;
let highScore = localStorage.getItem('adminRunHighScore') || 0;
let obstacles = [];
let frames = 0;
let nextObstacleFrame = 0;
let gameSpeed = INITIAL_SPEED;

highScoreEl.innerText = highScore;

const player = {
    x: 50,
    y: 200,
    width: 40,
    height: 40,
    dy: 0,
    grounded: true,
    draw: function() {
        // Draw a mini server rack
        ctx.fillStyle = '#1e90ff'; // Primary color
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Server lights
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x + 5, this.y + 5, 8, 8);
        ctx.fillRect(this.x + 5, this.y + 20, 8, 8);
        
        ctx.fillStyle = '#ff0000'; // Blinking light maybe
        if (frames % 20 < 10) {
            ctx.fillRect(this.x + 20, this.y + 5, 8, 8);
        }
    },
    jump: function() {
        if (this.grounded) {
            this.dy = JUMP_POWER;
            this.grounded = false;
        }
    },
    update: function() {
        this.dy += GRAVITY;
        this.y += this.dy;

        // Ground collision
        if (this.y + this.height >= 280) {
            this.y = 280 - this.height;
            this.dy = 0;
            this.grounded = true;
        }

        this.draw();
    }
};

class Obstacle {
    constructor() {
        this.width = Math.random() > 0.5 ? 30 : 40;
        this.height = Math.random() > 0.5 ? 40 : 60;
        this.x = canvas.width;
        this.y = 280 - this.height;
        this.type = Math.random() > 0.5 ? 'router' : 'bug';
    }

    draw() {
        if (this.type === 'router') {
            ctx.fillStyle = '#ff4500'; // Orange red fire
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Draw fire emoji
            ctx.font = "20px Arial";
            ctx.fillText("🔥", this.x + 5, this.y + 25);
        } else {
            ctx.fillStyle = '#8a2be2'; // Bug
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.font = "20px Arial";
            ctx.fillText("🐛", this.x + 5, this.y + 25);
        }
    }

    update() {
        this.x -= gameSpeed;
        this.draw();
    }
}

function handleObstacles() {
    if (frames >= nextObstacleFrame) {
        obstacles.push(new Obstacle());
        // Calculate safe distance based on speed
        // Min frames = 70, Max frames = 150
        nextObstacleFrame = frames + Math.floor(Math.random() * 80 + 70);
    }

    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.update();

        // Collision detection
        if (player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y) {
            gameOver();
        }

        // Remove off-screen obstacles
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            score += 10;
            scoreEl.innerText = score;
            i--;
        }
    }
}

function drawGround() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 280);
    ctx.lineTo(canvas.width, 280);
    ctx.stroke();
    
    // Draw some binary in background
    ctx.fillStyle = 'rgba(30, 144, 255, 0.1)';
    ctx.font = "14px monospace";
    for(let i=0; i<10; i++) {
        let x = (frames * 0.5 + i * 80) % canvas.width;
        ctx.fillText("01101001", canvas.width - x, 100 + (i%3)*50);
    }
}

function updateGame() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawGround();
    player.update();
    handleObstacles();
    
    frames++;
    
    // Increase speed slightly but slower
    if (frames % 1000 === 0) {
        gameSpeed += 0.2;
    }

    animationId = requestAnimationFrame(updateGame);
}

function resetGame() {
    score = 0;
    frames = 0;
    nextObstacleFrame = 50; // First obstacle appears after 50 frames
    gameSpeed = INITIAL_SPEED;
    obstacles = [];
    player.y = 200;
    player.dy = 0;
    player.grounded = true;
    scoreEl.innerText = score;
    startOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    gameRunning = true;
    updateGame();
}

function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('adminRunHighScore', highScore);
        highScoreEl.innerText = highScore;
        
        if (typeof showToast === 'function') {
            showToast('Nouveau Record ! 🏆', 'success');
        }
    }
    
    finalScoreEl.innerText = score;
    gameOverOverlay.classList.remove('hidden');
}

// Controls
window.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'ArrowUp') && gameRunning) {
        e.preventDefault();
        player.jump();
    } else if (e.code === 'Space' && !gameRunning) {
        e.preventDefault();
        resetGame();
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameRunning) {
        player.jump();
    } else {
        resetGame();
    }
});

startBtn.addEventListener('click', resetGame);
restartBtn.addEventListener('click', resetGame);

// Difficulty selection
const diffBtns = document.querySelectorAll('.diff-btn');
diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        diffBtns.forEach(b => {
            b.style.background = 'transparent';
            b.style.color = b.dataset.speed === "5.5" ? '#ff4500' : '#1e90ff';
            b.classList.remove('active');
        });
        btn.classList.add('active');
        btn.style.background = btn.dataset.speed === "5.5" ? '#ff4500' : '#1e90ff';
        btn.style.color = '#fff';
        INITIAL_SPEED = parseFloat(btn.dataset.speed);
    });
});

// Initial draw
ctx.fillStyle = '#111';
ctx.fillRect(0, 0, canvas.width, canvas.height);
drawGround();
player.draw();


const fullscreenBtn = document.getElementById('fullscreen-btn');
const gameContainer = document.querySelector('.game-container');

if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            gameContainer.requestFullscreen().catch(err => {
                console.error("Erreur plein ?cran: " + err.message);
            });
        } else {
            document.exitFullscreen();
        }
    });
}

