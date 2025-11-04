// 游戏配置
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 设置Canvas尺寸
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

// 游戏状态
let gameState = 'start'; // 'start', 'playing', 'gameover'
let animationId;
let gameTime = 0;
let bestTime = localStorage.getItem('bestTime') || 0;
let dodgeCount = 0;
let lastTime = 0;

// 玩家
const player = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    size: 15,
    smoothing: 0.15,
    color: '#ff69b4',
    trail: [],
    isTouching: false
};

// 触摸控制
let touchActive = false;

function getTouchPos(touch) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (touch.clientX - rect.left) * (canvas.width / rect.width),
        y: (touch.clientY - rect.top) * (canvas.height / rect.height)
    };
}

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === 'playing' && e.touches.length > 0) {
        touchActive = true;
        player.isTouching = true;
        const pos = getTouchPos(e.touches[0]);
        player.targetX = pos.x;
        player.targetY = pos.y;
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (gameState === 'playing' && e.touches.length > 0) {
        touchActive = true;
        const pos = getTouchPos(e.touches[0]);
        player.targetX = pos.x;
        player.targetY = pos.y;
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (e.touches.length === 0) {
        touchActive = false;
        player.isTouching = false;
    }
});

canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    touchActive = false;
    player.isTouching = false;
});

// 防止页面滚动
document.body.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// 弹幕数组
let bullets = [];

// 粒子系统
let particles = [];

// 背景爱心
let hearts = [];

// 难度配置
const difficultyLevels = {
    easy: { name: '简单', bulletSpeed: 2, spawnRate: 60, maxBullets: 15 },
    medium: { name: '普通', bulletSpeed: 3, spawnRate: 45, maxBullets: 20 },
    hard: { name: '困难', bulletSpeed: 4, spawnRate: 35, maxBullets: 25 },
    veryHard: { name: '非常困难', bulletSpeed: 5, spawnRate: 25, maxBullets: 30 },
    extreme: { name: '极限', bulletSpeed: 6, spawnRate: 20, maxBullets: 40 }
};

let currentDifficulty = difficultyLevels.easy;

// 弹幕类
class Bullet {
    constructor() {
        this.size = Math.random() * 15 + 10;
        this.x = Math.random() * (canvas.width - this.size * 2) + this.size;
        this.y = -this.size;
        this.speed = currentDifficulty.bulletSpeed + Math.random() * 2;
        this.color = this.getRandomColor();
        this.shape = Math.floor(Math.random() * 3); // 0: 圆形, 1: 方形, 2: 三角形
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }

    getRandomColor() {
        const colors = ['#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#3b82f6'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;

        if (this.shape === 0) {
            // 圆形
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else if (this.shape === 1) {
            // 方形
            ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
            ctx.strokeRect(-this.size, -this.size, this.size * 2, this.size * 2);
        } else {
            // 三角形
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.lineTo(-this.size, this.size);
            ctx.lineTo(this.size, this.size);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }

    isOffScreen() {
        return this.y > canvas.height + this.size;
    }
}

// 粒子类
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = (Math.random() - 0.5) * 8;
        this.color = color;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        this.speedX *= 0.98;
        this.speedY *= 0.98;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 背景爱心类
class Heart {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 10 + 5;
        this.speedY = Math.random() * 0.5 + 0.2;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.pulseSpeed = Math.random() * 0.05 + 0.02;
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update() {
        this.y += this.speedY;
        this.pulsePhase += this.pulseSpeed;
        if (this.y > canvas.height + this.size) {
            this.y = -this.size;
            this.x = Math.random() * canvas.width;
        }
    }

    draw() {
        const pulseFactor = 1 + Math.sin(this.pulsePhase) * 0.2;
        const size = this.size * pulseFactor;

        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#ff69b4';
        ctx.translate(this.x, this.y);
        
        ctx.beginPath();
        ctx.moveTo(0, size / 4);
        ctx.bezierCurveTo(-size, -size / 2, -size * 1.5, size / 2, 0, size * 1.5);
        ctx.bezierCurveTo(size * 1.5, size / 2, size, -size / 2, 0, size / 4);
        ctx.fill();
        
        ctx.restore();
    }
}

// 初始化背景爱心
function initHearts() {
    hearts = [];
    for (let i = 0; i < 15; i++) {
        hearts.push(new Heart());
    }
}

// 更新难度
function updateDifficulty() {
    if (gameTime < 10) {
        currentDifficulty = difficultyLevels.easy;
    } else if (gameTime < 25) {
        currentDifficulty = difficultyLevels.medium;
    } else if (gameTime < 45) {
        currentDifficulty = difficultyLevels.hard;
    } else if (gameTime < 70) {
        currentDifficulty = difficultyLevels.veryHard;
    } else {
        currentDifficulty = difficultyLevels.extreme;
    }
    document.getElementById('difficultyDisplay').textContent = currentDifficulty.name;
}

// 生成弹幕
function spawnBullets() {
    if (bullets.length < currentDifficulty.maxBullets && Math.random() < 1 / currentDifficulty.spawnRate) {
        bullets.push(new Bullet());
    }
}

// 更新玩家位置
function updatePlayer() {
    if (touchActive) {
        // 平滑跟随触摸位置
        const dx = player.targetX - player.x;
        const dy = player.targetY - player.y;
        player.x += dx * player.smoothing;
        player.y += dy * player.smoothing;
    }

    // 边界限制
    player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));

    // 更新轨迹
    player.trail.push({ x: player.x, y: player.y, life: 1 });
    if (player.trail.length > 15) {
        player.trail.shift();
    }
    player.trail.forEach(t => t.life -= 0.05);
}

// 绘制玩家
function drawPlayer() {
    // 绘制轨迹
    player.trail.forEach((point, index) => {
        if (point.life > 0) {
            ctx.save();
            ctx.globalAlpha = point.life * 0.3;
            ctx.fillStyle = player.color;
            const size = player.size * point.life;
            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    });

    // 绘制玩家（心形）
    ctx.save();
    ctx.fillStyle = player.color;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.translate(player.x, player.y);
    
    const size = player.size * (player.isTouching ? 1.2 : 1);
    ctx.beginPath();
    ctx.moveTo(0, size / 4);
    ctx.bezierCurveTo(-size, -size / 2, -size * 1.5, size / 2, 0, size * 1.5);
    ctx.bezierCurveTo(size * 1.5, size / 2, size, -size / 2, 0, size / 4);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();

    // 绘制光环（触摸时更亮）
    ctx.save();
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = player.isTouching ? 0.6 : 0.3;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size * 1.8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 绘制触摸指示器
    if (touchActive && player.isTouching) {
        ctx.save();
        ctx.strokeStyle = player.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(player.targetX, player.targetY);
        ctx.stroke();
        ctx.restore();
    }
}

// 碰撞检测
function checkCollisions() {
    for (let bullet of bullets) {
        const dx = player.x - bullet.x;
        const dy = player.y - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < player.size + bullet.size) {
            gameOver();
            return;
        }
    }
}

// 创建粒子效果
function createParticles(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// 更新游戏
function update(timestamp) {
    if (gameState !== 'playing') return;

    // 计算增量时间
    if (!lastTime) lastTime = timestamp;
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    gameTime += deltaTime;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景爱心
    hearts.forEach(heart => {
        heart.update();
        heart.draw();
    });

    // 更新难度
    updateDifficulty();

    // 生成弹幕
    spawnBullets();

    // 更新和绘制弹幕
    bullets = bullets.filter(bullet => {
        bullet.update();
        bullet.draw();
        
        // 统计躲避次数
        if (bullet.isOffScreen()) {
            dodgeCount++;
            document.getElementById('dodgeCount').textContent = dodgeCount;
            createParticles(bullet.x, canvas.height, bullet.color, 10);
            return false;
        }
        return true;
    });

    // 更新和绘制粒子
    particles = particles.filter(particle => {
        particle.update();
        particle.draw();
        return particle.life > 0;
    });

    // 更新玩家
    updatePlayer();

    // 检测碰撞
    checkCollisions();

    // 绘制玩家
    drawPlayer();

    // 更新显示
    document.getElementById('timeDisplay').textContent = gameTime.toFixed(1) + '秒';

    animationId = requestAnimationFrame(update);
}

// 开始游戏
function startGame() {
    resizeCanvas();
    
    gameState = 'playing';
    gameTime = 0;
    lastTime = 0;
    dodgeCount = 0;
    bullets = [];
    particles = [];
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
    player.targetX = player.x;
    player.targetY = player.y;
    player.trail = [];
    player.isTouching = false;
    touchActive = false;
    
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('timeDisplay').textContent = '0.0秒';
    document.getElementById('dodgeCount').textContent = '0';
    
    initHearts();
    animationId = requestAnimationFrame(update);
}

// 游戏结束
function gameOver() {
    gameState = 'gameover';
    cancelAnimationFrame(animationId);
    
    // 更新最高记录
    if (gameTime > bestTime) {
        bestTime = gameTime;
        localStorage.setItem('bestTime', bestTime);
        document.getElementById('bestTimeDisplay').textContent = bestTime.toFixed(1) + '秒';
    }
    
    // 显示结束界面
    document.getElementById('finalTime').textContent = gameTime.toFixed(1);
    document.getElementById('finalDodges').textContent = dodgeCount;
    document.getElementById('gameOverScreen').classList.remove('hidden');
    
    // 爆炸效果
    createParticles(player.x, player.y, player.color, 50);
}

// 重新开始
function restart() {
    startGame();
}

// 初始化
function init() {
    resizeCanvas();
    
    // 初始化玩家位置
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
    player.targetX = player.x;
    player.targetY = player.y;
    
    document.getElementById('bestTimeDisplay').textContent = (parseFloat(bestTime) || 0).toFixed(1) + '秒';
    
    // 事件监听
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', restart);
    
    // 窗口大小改变时重新调整
    window.addEventListener('resize', () => {
        if (gameState !== 'playing') {
            resizeCanvas();
            player.x = canvas.width / 2;
            player.y = canvas.height - 100;
        }
    });
    
    // 屏幕方向改变时重新调整
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            resizeCanvas();
            if (gameState !== 'playing') {
                player.x = canvas.width / 2;
                player.y = canvas.height - 100;
            }
        }, 100);
    });
    
    // 初始化背景爱心
    initHearts();
    
    // 绘制初始背景
    function drawBackground() {
        if (gameState !== 'playing') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            hearts.forEach(heart => {
                heart.update();
                heart.draw();
            });
            requestAnimationFrame(drawBackground);
        }
    }
    drawBackground();
}

// 启动游戏
init();

