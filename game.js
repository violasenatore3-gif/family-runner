// ===== Game State Management =====
const GameState = {
    LANDING: 'landing',
    SELECTION: 'selection',
    PLAYING: 'playing',
    GAMEOVER: 'gameover'
};

let currentState = GameState.LANDING;
let selectedCharacter = null;
let score = 0;
let gameStarted = false;
let animationId = null;

// ===== Family Members Data =====
const familyMembers = [
    { id: 'mamma', name: 'Mamma', image: 'assets/mamma.png', gender: 'female' },
    { id: 'papa', name: 'Papà', image: 'assets/papa.png', gender: 'male' },
    { id: 'ari', name: 'Ari', image: 'assets/ari.png', gender: 'female' },
    { id: 'mattia', name: 'Mattia', image: 'assets/mattia.png', gender: 'male' },
    { id: 'saydeh', name: 'Saydeh', image: 'assets/saydeh.png', gender: 'female' },
    { id: 'emma', name: 'Emma', image: 'assets/emma.png', gender: 'female' },
    { id: 'nadia', name: 'Nadia', image: 'assets/nadia.png', gender: 'female' }
];

// ===== DOM Elements =====
const screens = {
    landing: document.getElementById('landing-screen'),
    selection: document.getElementById('selection-screen'),
    game: document.getElementById('game-screen'),
    gameover: document.getElementById('gameover-screen'),
    leaderboard: document.getElementById('leaderboard-screen')
};

const elements = {
    startBtn: document.getElementById('start-btn'),
    leaderboardBtn: document.getElementById('leaderboard-btn'),
    backToMenuBtn: document.getElementById('back-to-menu-btn'),
    playBtn: document.getElementById('play-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    changeCharacterBtn: document.getElementById('change-character-btn'),
    characterGrid: document.getElementById('character-grid'),
    characterPreview: document.getElementById('character-preview'),
    previewFace: document.getElementById('preview-face'),
    previewName: document.getElementById('preview-name'),
    scoreDisplay: document.getElementById('score'),
    finalScore: document.getElementById('final-score'),
    gameoverFace: document.getElementById('gameover-face'),
    startPrompt: document.getElementById('start-prompt'),
    canvas: document.getElementById('game-canvas'),
    leaderboardList: document.getElementById('leaderboard-list')
};

// ===== Canvas Setup =====
const ctx = elements.canvas.getContext('2d');
let canvasWidth, canvasHeight;

function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    elements.canvas.width = canvasWidth;
    elements.canvas.height = canvasHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ===== Game Objects =====
class Dino {
    constructor() {
        this.width = 60;
        this.height = 80;
        this.x = 100;
        this.y = canvasHeight - 150 - this.height;
        this.velocityY = 0;
        this.gravity = 0.8;
        this.jumpPower = -20;
        this.isJumping = false;
        this.groundY = canvasHeight - 150 - this.height;
        this.faceImage = new Image();
        if (selectedCharacter) {
            this.faceImage.src = selectedCharacter.image;
        }
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = this.jumpPower;
            this.isJumping = true;
        }
    }

    update() {
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.velocityY = 0;
            this.isJumping = false;
        }
    }

    draw() {
        const runCycle = Math.floor(Date.now() / 150) % 2;
        const isFemale = selectedCharacter && selectedCharacter.gender === 'female';

        // Colors based on gender
        const shirtColor = isFemale ? '#FF69B4' : '#4A90E2'; // Pink for female, blue for male
        const bottomColor = isFemale ? '#FF1493' : '#2C3E50'; // Deep pink for female, dark for male

        // Draw body (torso)
        ctx.fillStyle = shirtColor;
        ctx.fillRect(this.x + 5, this.y + 35, this.width - 10, 30);

        // Draw arms
        ctx.fillStyle = '#FFD1A3'; // Skin tone for arms
        const armSwing = runCycle === 0 ? -5 : 5;
        // Left arm
        ctx.fillRect(this.x, this.y + 40 + armSwing, 8, 25);
        // Right arm
        ctx.fillRect(this.x + this.width - 8, this.y + 40 - armSwing, 8, 25);

        if (isFemale) {
            // Draw skirt for female characters
            ctx.fillStyle = bottomColor;
            // Skirt shape (trapezoid)
            ctx.beginPath();
            ctx.moveTo(this.x + 5, this.y + 65); // Top left
            ctx.lineTo(this.x + this.width - 5, this.y + 65); // Top right
            ctx.lineTo(this.x + this.width - 2, this.y + 80); // Bottom right (wider)
            ctx.lineTo(this.x + 2, this.y + 80); // Bottom left (wider)
            ctx.closePath();
            ctx.fill();

            // Draw legs (visible below skirt)
            ctx.fillStyle = '#FFD1A3'; // Skin tone for legs
            const legOffset = runCycle === 0 ? 0 : 10;
            // Left leg
            ctx.fillRect(this.x + 15, this.y + 78, 10, 12 + legOffset);
            // Right leg
            ctx.fillRect(this.x + 35, this.y + 78, 10, 12 + (10 - legOffset));

            // Draw shoes
            ctx.fillStyle = '#C71585'; // Pink/magenta shoes
            ctx.fillRect(this.x + 13, this.y + 88 + legOffset, 14, 6);
            ctx.fillRect(this.x + 33, this.y + 88 + (10 - legOffset), 14, 6);
        } else {
            // Draw pants for male characters
            ctx.fillStyle = bottomColor;
            const legOffset = runCycle === 0 ? 0 : 10;
            // Left leg
            ctx.fillRect(this.x + 15, this.y + 65, 12, 25 + legOffset);
            // Right leg
            ctx.fillRect(this.x + 33, this.y + 65, 12, 25 + (10 - legOffset));

            // Draw shoes
            ctx.fillStyle = '#34495E';
            ctx.fillRect(this.x + 13, this.y + 88 + legOffset, 16, 6);
            ctx.fillRect(this.x + 31, this.y + 88 + (10 - legOffset), 16, 6);
        }

        // Draw neck
        ctx.fillStyle = '#FFD1A3'; // Skin tone
        ctx.fillRect(this.x + 22, this.y + 28, 16, 10);

        // Draw head (large circular background)
        ctx.fillStyle = '#FFD1A3'; // Skin tone
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 15, 25, 0, Math.PI * 2);
        ctx.fill();

        // Draw face photo (MUCH LARGER)
        if (this.faceImage.complete) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + 15, 25, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(this.faceImage, this.x + this.width / 2 - 25, this.y + 15 - 25, 50, 50);
            ctx.restore();
        }
    }

    getBounds() {
        return {
            x: this.x + 5,
            y: this.y + 5,
            width: this.width - 10,
            height: this.height - 10
        };
    }
}

class Obstacle {
    constructor(type) {
        this.type = type; // 'cactus' or 'bird'
        this.width = type === 'cactus' ? 30 : 40;
        this.height = type === 'cactus' ? 50 : 30;
        this.x = canvasWidth;
        this.y = type === 'cactus'
            ? canvasHeight - 150 - this.height
            : canvasHeight - 150 - 70;
        this.speed = 5;
    }

    update(gameSpeed) {
        this.x -= this.speed + gameSpeed;
    }

    draw() {
        if (this.type === 'cactus') {
            // Draw cactus
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillRect(this.x - 10, this.y + 15, 10, 20);
            ctx.fillRect(this.x + this.width, this.y + 15, 10, 20);
        } else {
            // Draw bird
            ctx.fillStyle = '#FF9800';
            ctx.beginPath();
            ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2,
                this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Wings
            const wingFlap = Math.floor(Date.now() / 150) % 2 === 0;
            ctx.fillStyle = '#FFA726';
            ctx.beginPath();
            ctx.ellipse(this.x + 5, this.y + this.height / 2,
                15, wingFlap ? 8 : 12, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(this.x + this.width - 5, this.y + this.height / 2,
                15, wingFlap ? 8 : 12, 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}

// ===== Game Variables =====
let dino;
let obstacles = [];
let gameSpeed = 0;
let frameCount = 0;
let lastObstacleFrame = 0;

// ===== Collision Detection =====
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
}

// ===== Game Loop =====
function gameLoop() {
    if (currentState !== GameState.PLAYING) {
        animationId = requestAnimationFrame(gameLoop);
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw ground
    ctx.fillStyle = '#F4E4C1';
    ctx.fillRect(0, canvasHeight - 150, canvasWidth, 150);

    // Draw ground line
    ctx.strokeStyle = '#D4C4A1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight - 150);
    ctx.lineTo(canvasWidth, canvasHeight - 150);
    ctx.stroke();

    // Always draw dino
    if (dino) {
        if (gameStarted) {
            frameCount++;

            // Update and draw dino
            dino.update();
            dino.draw();

            // Spawn obstacles
            if (frameCount - lastObstacleFrame > 100 - gameSpeed * 5) {
                const obstacleType = Math.random() > 0.5 ? 'cactus' : 'bird';
                obstacles.push(new Obstacle(obstacleType));
                lastObstacleFrame = frameCount;
            }

            // Update and draw obstacles
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obstacle = obstacles[i];
                obstacle.update(gameSpeed);
                obstacle.draw();

                // Check collision
                if (checkCollision(dino.getBounds(), obstacle.getBounds())) {
                    endGame();
                    return;
                }

                // Remove off-screen obstacles
                if (obstacle.isOffScreen()) {
                    obstacles.splice(i, 1);
                    score += 10;
                    elements.scoreDisplay.textContent = score;
                }
            }

            // Increase difficulty
            if (frameCount % 300 === 0 && gameSpeed < 5) {
                gameSpeed += 0.5;
            }
        } else {
            // Draw dino waiting (not moving)
            dino.draw();
        }
    }

    animationId = requestAnimationFrame(gameLoop);
}

// ===== Screen Management =====
function switchScreen(newState) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));

    switch (newState) {
        case GameState.LANDING:
            screens.landing.classList.add('active');
            break;
        case GameState.SELECTION:
            screens.selection.classList.add('active');
            break;
        case GameState.PLAYING:
            screens.game.classList.add('active');
            startGame();
            break;
        case GameState.GAMEOVER:
            screens.gameover.classList.add('active');
            break;
        case 'leaderboard':
            screens.leaderboard.classList.add('active');
            break;
    }

    currentState = newState;
}

// ===== Game Functions =====
function startGame() {
    score = 0;
    gameSpeed = 0;
    frameCount = 0;
    lastObstacleFrame = 0;
    obstacles = [];
    gameStarted = false;

    elements.scoreDisplay.textContent = '0';
    elements.startPrompt.style.display = 'block';

    dino = new Dino();
    resizeCanvas();

    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    gameLoop();
}

function beginGameplay() {
    gameStarted = true;
    elements.startPrompt.style.display = 'none';
    dino.jump();
}

function endGame() {
    gameStarted = false;
    elements.finalScore.textContent = score;
    elements.gameoverFace.src = selectedCharacter.image;

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    setTimeout(() => {
        switchScreen(GameState.GAMEOVER);
    }, 500);
}

// ===== Character Selection =====
function loadCharacters() {
    elements.characterGrid.innerHTML = '';

    familyMembers.forEach(member => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.id = member.id;

        const avatar = document.createElement('img');
        avatar.className = 'character-avatar';
        avatar.src = member.image;
        avatar.alt = member.name;
        avatar.onerror = function () {
            // Create placeholder if image doesn't exist
            this.style.background = 'linear-gradient(135deg, #87CEEB, #4ECDC4)';
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.textContent = member.name[0];
            this.style.fontSize = '3rem';
            this.style.fontWeight = 'bold';
            this.style.color = 'white';
        };

        const name = document.createElement('p');
        name.className = 'character-name';
        name.textContent = member.name;

        card.appendChild(avatar);
        card.appendChild(name);

        card.addEventListener('click', () => selectCharacter(member, card));

        elements.characterGrid.appendChild(card);
    });
}

function selectCharacter(member, cardElement) {
    selectedCharacter = member;

    // Update UI
    document.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('selected');
    });
    cardElement.classList.add('selected');

    // Show preview
    elements.previewFace.src = member.image;
    elements.previewName.textContent = member.name;
    elements.characterPreview.classList.remove('hidden');

    // Enable play button
    elements.playBtn.disabled = false;
}

// ===== Input Handling =====
function handleJump() {
    if (currentState === GameState.PLAYING && !gameStarted) {
        beginGameplay();
    } else if (currentState === GameState.PLAYING && gameStarted) {
        dino.jump();
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        handleJump();
    }
});

elements.canvas.addEventListener('click', handleJump);
elements.canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleJump();
});

// ===== Event Listeners =====
elements.startBtn.addEventListener('click', () => {
    switchScreen(GameState.SELECTION);
});

elements.playBtn.addEventListener('click', () => {
    if (selectedCharacter) {
        switchScreen(GameState.PLAYING);
    }
});

elements.playAgainBtn.addEventListener('click', () => {
    switchScreen(GameState.PLAYING);
});

elements.changeCharacterBtn.addEventListener('click', () => {
    switchScreen(GameState.SELECTION);
});

// ===== Initialize =====
loadCharacters();

// ===== Leaderboard System =====
function getLeaderboard() {
    const saved = localStorage.getItem('familyRunnerLeaderboard');
    return saved ? JSON.parse(saved) : {};
}

function saveLeaderboard(leaderboard) {
    localStorage.setItem('familyRunnerLeaderboard', JSON.stringify(leaderboard));
}

function updateLeaderboard(characterId, newScore) {
    const leaderboard = getLeaderboard();
    const currentBest = leaderboard[characterId] || 0;

    if (newScore > currentBest) {
        leaderboard[characterId] = newScore;
        saveLeaderboard(leaderboard);
        return true; // New high score!
    }
    return false;
}

function displayLeaderboard() {
    const leaderboard = getLeaderboard();
    const leaderboardArray = [];

    // Convert to array with character info
    familyMembers.forEach(member => {
        leaderboardArray.push({
            id: member.id,
            name: member.name,
            image: member.image,
            score: leaderboard[member.id] || 0
        });
    });

    // Sort by score descending
    leaderboardArray.sort((a, b) => b.score - a.score);

    // Display
    elements.leaderboardList.innerHTML = '';

    if (leaderboardArray.every(entry => entry.score === 0)) {
        elements.leaderboardList.innerHTML = '<div class="leaderboard-empty">No scores yet! Start playing to see rankings!</div>';
        return;
    }

    leaderboardArray.forEach((entry, index) => {
        const rank = index + 1;
        let rankClass = '';
        if (rank === 1) rankClass = 'gold';
        else if (rank === 2) rankClass = 'silver';
        else if (rank === 3) rankClass = 'bronze';

        const entryDiv = document.createElement('div');
        entryDiv.className = 'leaderboard-entry';
        entryDiv.innerHTML = `
            <div class="leaderboard-rank ${rankClass}">${rank}</div>
            <img src="${entry.image}" alt="${entry.name}" class="leaderboard-avatar">
            <div class="leaderboard-info">
                <div class="leaderboard-name">${entry.name}</div>
            </div>
            <div class="leaderboard-score">${entry.score}</div>
        `;
        elements.leaderboardList.appendChild(entryDiv);
    });
}

// Add leaderboard event listeners
elements.leaderboardBtn.addEventListener('click', () => {
    displayLeaderboard();
    switchScreen('leaderboard');
});

elements.backToMenuBtn.addEventListener('click', () => {
    switchScreen(GameState.LANDING);
});

// Update game over to save score
const originalGameOver = gameOver;
function gameOver() {
    if (selectedCharacter) {
        const isNewHighScore = updateLeaderboard(selectedCharacter.id, score);
        if (isNewHighScore) {
            console.log('New high score for', selectedCharacter.name, ':', score);
        }
    }
    originalGameOver();
}
