// 游戏配置
const CONFIG = {
    maxLevel: 10,
    baseEnemyCount: 5,
    enemyIncrement: 3,
    baseEnemySpeed: 1,
    speedIncrement: 0.3,
    playerSize: 20,
    enemySize: 8,
    levelDuration: 30, // 每关30秒
    colors: {
        player: '#FF69B4',
        playerGlow: '#FF1493',
        enemy: '#666666',
        enemyGlow: '#333333',
        background: '#000000',
        particle: '#FFB6C1',
    }
};

// 游戏状态
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAMEOVER: 'gameover',
    VICTORY: 'victory'
};

// 游戏类
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = GameState.MENU;
        this.level = 1;
        this.score = 0;
        this.startTime = 0;
        this.levelStartTime = 0;
        this.player = null;
        this.enemies = [];
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.touch = { x: 0, y: 0 };
        this.isTouch = false;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.setupUI();
        
        // 爱情语录
        this.loveQuotes = [
            "242天，每一天都是新的开始，每一天都更爱你一点 💕",
            "时光荏苒，我们的爱却历久弥新 💖",
            "242天的相守，是最美的承诺 💗",
            "遇见你，是我最美的意外；爱上你，是我最对的决定 💝",
            "242天只是开始，我们还有一生的时间相爱 💞",
            "你是我的小确幸，是我生命中最美的风景 💓",
            "242天的陪伴，让我明白什么是幸福 💘",
            "感谢时光，让我们在242天里相知相守 💕"
        ];
    }
    
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        // 鼠标控制
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.state === GameState.PLAYING && !this.isTouch) {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
            }
        });
        
        // 触摸控制
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isTouch = true;
            if (this.state === GameState.PLAYING) {
                const rect = this.canvas.getBoundingClientRect();
                const touch = e.touches[0];
                this.touch.x = touch.clientX - rect.left;
                this.touch.y = touch.clientY - rect.top;
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.state === GameState.PLAYING) {
                const rect = this.canvas.getBoundingClientRect();
                const touch = e.touches[0];
                this.touch.x = touch.clientX - rect.left;
                this.touch.y = touch.clientY - rect.top;
            }
        }, { passive: false });
        
        // 防止双指缩放
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        document.addEventListener('gesturechange', (e) => e.preventDefault());
    }
    
    setupUI() {
        // 开始按钮
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        // 暂停按钮
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.pauseGame();
        });
        
        // 继续按钮
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.resumeGame();
        });
        
        // 重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // 退出按钮
        document.getElementById('quit-btn').addEventListener('click', () => {
            this.quitGame();
        });
        
        // 再玩一次按钮
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // 返回首页按钮
        document.getElementById('back-btn').addEventListener('click', () => {
            this.quitGame();
        });
        
        // 再次挑战按钮
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    startGame() {
        this.state = GameState.PLAYING;
        this.level = 1;
        this.score = 0;
        this.startTime = Date.now();
        this.levelStartTime = Date.now();
        
        // 初始化玩家
        this.player = new Player(
            this.canvas.width / 2,
            this.canvas.height / 2,
            CONFIG.playerSize
        );
        
        // 初始化敌人
        this.initEnemies();
        
        // 切换界面
        this.showScreen('game-screen');
        
        // 开始游戏循环
        this.gameLoop();
    }
    
    initEnemies() {
        this.enemies = [];
        const enemyCount = CONFIG.baseEnemyCount + (this.level - 1) * CONFIG.enemyIncrement;
        const enemySpeed = CONFIG.baseEnemySpeed + (this.level - 1) * CONFIG.speedIncrement;
        
        for (let i = 0; i < enemyCount; i++) {
            // 从边缘随机生成敌人
            let x, y;
            const side = Math.floor(Math.random() * 4);
            
            switch (side) {
                case 0: // 上
                    x = Math.random() * this.canvas.width;
                    y = -CONFIG.enemySize;
                    break;
                case 1: // 右
                    x = this.canvas.width + CONFIG.enemySize;
                    y = Math.random() * this.canvas.height;
                    break;
                case 2: // 下
                    x = Math.random() * this.canvas.width;
                    y = this.canvas.height + CONFIG.enemySize;
                    break;
                case 3: // 左
                    x = -CONFIG.enemySize;
                    y = Math.random() * this.canvas.height;
                    break;
            }
            
            this.enemies.push(new Enemy(x, y, CONFIG.enemySize, enemySpeed));
        }
    }
    
    gameLoop() {
        if (this.state !== GameState.PLAYING) return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - this.startTime) / 1000);
        const levelTime = Math.floor((currentTime - this.levelStartTime) / 1000);
        
        // 更新UI
        document.getElementById('level').textContent = this.level;
        document.getElementById('score').textContent = this.score;
        document.getElementById('time').textContent = elapsedTime + 's';
        
        // 检查是否通过当前关卡
        if (levelTime >= CONFIG.levelDuration) {
            this.nextLevel();
            return;
        }
        
        // 更新玩家位置
        const target = this.isTouch ? this.touch : this.mouse;
        this.player.update(target);
        
        // 更新敌人
        this.enemies.forEach(enemy => {
            enemy.update(this.player);
        });
        
        // 检测碰撞
        this.checkCollisions();
        
        // 更新粒子
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });
        
        // 增加分数
        this.score += 1;
    }
    
    render() {
        // 清空画布
        this.ctx.fillStyle = CONFIG.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制粒子
        this.particles.forEach(particle => particle.render(this.ctx));
        
        // 绘制敌人
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        // 绘制玩家
        this.player.render(this.ctx);
        
        // 绘制关卡进度条
        this.renderLevelProgress();
    }
    
    renderLevelProgress() {
        const currentTime = Date.now();
        const levelTime = (currentTime - this.levelStartTime) / 1000;
        const progress = Math.min(levelTime / CONFIG.levelDuration, 1);
        
        const barWidth = this.canvas.width * 0.6;
        const barHeight = 8;
        const barX = (this.canvas.width - barWidth) / 2;
        const barY = this.canvas.height - 60;
        
        // 背景
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 进度
        const gradient = this.ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
        gradient.addColorStop(0, '#FF69B4');
        gradient.addColorStop(1, '#FF1493');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);
        
        // 边框
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    checkCollisions() {
        for (let enemy of this.enemies) {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.size + enemy.size) {
                this.gameOver();
                return;
            }
        }
    }
    
    nextLevel() {
        this.level++;
        this.levelStartTime = Date.now();
        
        if (this.level > CONFIG.maxLevel) {
            this.victory();
        } else {
            // 生成新的敌人
            this.initEnemies();
            
            // 创建关卡过渡效果
            this.createLevelTransition();
        }
    }
    
    createLevelTransition() {
        // 创建粒子效果
        for (let i = 0; i < 50; i++) {
            this.particles.push(new Particle(
                this.canvas.width / 2,
                this.canvas.height / 2,
                Math.random() * 360,
                Math.random() * 5 + 5
            ));
        }
    }
    
    pauseGame() {
        if (this.state === GameState.PLAYING) {
            this.state = GameState.PAUSED;
            this.showScreen('pause-screen');
        }
    }
    
    resumeGame() {
        if (this.state === GameState.PAUSED) {
            this.state = GameState.PLAYING;
            this.showScreen('game-screen');
            this.gameLoop();
        }
    }
    
    restartGame() {
        this.hideAllScreens();
        this.startGame();
    }
    
    quitGame() {
        this.state = GameState.MENU;
        this.hideAllScreens();
        this.showScreen('start-screen');
    }
    
    gameOver() {
        this.state = GameState.GAMEOVER;
        
        // 更新最终数据
        const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        document.getElementById('final-level').textContent = this.level;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-time').textContent = elapsedTime + 's';
        
        // 随机显示爱情语录
        const randomQuote = this.loveQuotes[Math.floor(Math.random() * this.loveQuotes.length)];
        document.getElementById('love-quote').textContent = randomQuote;
        
        this.showScreen('gameover-screen');
    }
    
    victory() {
        this.state = GameState.VICTORY;
        
        // 更新最终数据
        const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        document.getElementById('victory-score').textContent = this.score;
        document.getElementById('victory-time').textContent = elapsedTime + 's';
        
        this.showScreen('victory-screen');
    }
    
    showScreen(screenId) {
        this.hideAllScreens();
        document.getElementById(screenId).classList.add('active');
    }
    
    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }
}

// 玩家类
class Player {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.targetX = x;
        this.targetY = y;
        this.smoothness = 0.15;
    }
    
    update(target) {
        // 平滑移动到目标位置
        this.targetX = target.x;
        this.targetY = target.y;
        
        this.x += (this.targetX - this.x) * this.smoothness;
        this.y += (this.targetY - this.y) * this.smoothness;
        
        // 边界限制
        this.x = Math.max(this.size, Math.min(this.x, window.innerWidth - this.size));
        this.y = Math.max(this.size, Math.min(this.y, window.innerHeight - this.size));
    }
    
    render(ctx) {
        // 绘制光晕
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
        gradient.addColorStop(0, CONFIG.colors.playerGlow + '80');
        gradient.addColorStop(0.5, CONFIG.colors.playerGlow + '40');
        gradient.addColorStop(1, CONFIG.colors.playerGlow + '00');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - this.size * 2, this.y - this.size * 2, this.size * 4, this.size * 4);
        
        // 绘制爱心
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.size / 10, this.size / 10);
        
        ctx.beginPath();
        ctx.moveTo(0, 3);
        ctx.bezierCurveTo(-5, -3, -10, -1, -10, 5);
        ctx.bezierCurveTo(-10, 8, -7, 11, 0, 14);
        ctx.bezierCurveTo(7, 11, 10, 8, 10, 5);
        ctx.bezierCurveTo(10, -1, 5, -3, 0, 3);
        ctx.closePath();
        
        ctx.fillStyle = CONFIG.colors.player;
        ctx.fill();
        
        // 描边
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        
        ctx.restore();
    }
}

// 敌人类
class Enemy {
    constructor(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
    }
    
    update(player) {
        // 追踪玩家
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }
    
    render(ctx) {
        // 绘制光晕
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
        gradient.addColorStop(0, CONFIG.colors.enemyGlow + '60');
        gradient.addColorStop(0.5, CONFIG.colors.enemyGlow + '30');
        gradient.addColorStop(1, CONFIG.colors.enemyGlow + '00');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制敌人
        ctx.fillStyle = CONFIG.colors.enemy;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 描边
        ctx.strokeStyle = CONFIG.colors.enemyGlow;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

// 粒子类
class Particle {
    constructor(x, y, angle, speed) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle * Math.PI / 180) * speed;
        this.vy = Math.sin(angle * Math.PI / 180) * speed;
        this.life = 1;
        this.decay = 0.02;
        this.size = Math.random() * 3 + 2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.vx *= 0.98;
        this.vy *= 0.98;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = CONFIG.colors.particle;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});

