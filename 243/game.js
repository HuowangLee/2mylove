// 游戏状态管理
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    LEVEL_COMPLETE: 'level_complete',
    GAME_OVER: 'game_over',
    VICTORY: 'victory'
};

// 游戏主类
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 游戏状态
        this.state = GameState.MENU;
        this.currentLevel = 1;
        this.maxLevel = 10;
        this.score = 0;
        this.heartsLeft = 3;
        
        // 物理参数
        this.gravity = 0.3;  // 降低重力，让爱心飞得更远
        
        // 玩家发射器（先初始化对象）
        this.launcher = {
            x: 150,  // 增加x坐标，离左边缘更远
            y: 0,
            radius: 25,
            color: '#ff6b9d'
        };
        
        // 设置canvas尺寸（必须在launcher初始化之后）
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 爱心抛物体
        this.heart = null;
        this.isAiming = false;
        this.aimStartX = 0;
        this.aimStartY = 0;
        this.aimEndX = 0;
        this.aimEndY = 0;
        
        // 目标
        this.target = {
            x: 0,
            y: 0,
            radius: 40,
            hit: false
        };
        
        // 障碍物
        this.obstacles = [];
        
        // 轨迹点
        this.trajectoryPoints = [];
        
        // 粒子效果
        this.particles = [];
        
        // 关卡配置
        this.levels = this.createLevels();
        
        // 初始化
        this.initEventListeners();
        this.showScreen('start-screen');
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // 更新发射器位置（离底部更远，给手指留出操作空间）
        this.launcher.y = this.canvas.height - 150;
    }
    
    createLevels() {
        return [
            // 关卡1：简单开始
            {
                target: { x: 0.8, y: 0.3 },
                obstacles: []
            },
            // 关卡2：单个障碍
            {
                target: { x: 0.8, y: 0.5 },
                obstacles: [
                    { x: 0.5, y: 0.5, width: 20, height: 200, type: 'wall' }
                ]
            },
            // 关卡3：需要绕过障碍
            {
                target: { x: 0.75, y: 0.7 },
                obstacles: [
                    { x: 0.45, y: 0.55, width: 30, height: 250, type: 'wall' }
                ]
            },
            // 关卡4：移动目标
            {
                target: { x: 0.7, y: 0.4, moving: true, speed: 2, range: 100 },
                obstacles: [
                    { x: 0.5, y: 0.3, width: 20, height: 150, type: 'wall' }
                ]
            },
            // 关卡5：多个障碍
            {
                target: { x: 0.8, y: 0.3 },
                obstacles: [
                    { x: 0.45, y: 0.6, width: 20, height: 200, type: 'wall' },
                    { x: 0.65, y: 0.3, width: 20, height: 180, type: 'wall' }
                ]
            },
            // 关卡6：天花板
            {
                target: { x: 0.85, y: 0.7 },
                obstacles: [
                    { x: 0.35, y: 0.0, width: 350, height: 20, type: 'ceiling' },
                    { x: 0.55, y: 0.45, width: 20, height: 200, type: 'wall' }
                ]
            },
            // 关卡7：狭窄通道
            {
                target: { x: 0.8, y: 0.5 },
                obstacles: [
                    { x: 0.5, y: 0.0, width: 30, height: 200, type: 'wall' },
                    { x: 0.5, y: 0.65, width: 30, height: 200, type: 'wall' }
                ]
            },
            // 关卡8：Z字型
            {
                target: { x: 0.85, y: 0.2 },
                obstacles: [
                    { x: 0.45, y: 0.55, width: 25, height: 220, type: 'wall' },
                    { x: 0.68, y: 0.0, width: 25, height: 250, type: 'wall' }
                ]
            },
            // 关卡9：复杂迷宫
            {
                target: { x: 0.8, y: 0.5, moving: true, speed: 1, range: 50 },
                obstacles: [
                    { x: 0.45, y: 0.55, width: 20, height: 250, type: 'wall' },
                    { x: 0.65, y: 0.15, width: 20, height: 200, type: 'wall' }
                ]
            },
            // 关卡10：最终挑战
            {
                target: { x: 0.8, y: 0.5, moving: true, speed: 3, range: 120 },
                obstacles: [
                    { x: 0.35, y: 0.0, width: 300, height: 25, type: 'ceiling' },
                    { x: 0.42, y: 0.5, width: 25, height: 270, type: 'wall' },
                    { x: 0.6, y: 0.2, width: 25, height: 230, type: 'wall' },
                    { x: 0.77, y: 0.55, width: 25, height: 250, type: 'wall' }
                ]
            }
        ];
    }
    
    initEventListeners() {
        // 开始按钮
        const startBtn = document.getElementById('start-btn');
        console.log('开始按钮元素:', startBtn);
        
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('点击了开始按钮！');
                this.startGame();
            });
        } else {
            console.error('找不到开始按钮！');
        }
        
        // 下一关按钮
        document.getElementById('next-level-btn').addEventListener('click', () => {
            this.nextLevel();
        });
        
        // 重试按钮
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // 返回菜单按钮
        document.getElementById('back-menu-btn').addEventListener('click', () => {
            this.backToMenu();
        });
        
        // 再玩一次按钮
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // 重新开始关卡按钮
        document.getElementById('reset-level').addEventListener('click', () => {
            this.resetLevel();
        });
        
        // 触摸/鼠标事件
        this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleEnd(e));
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleStart(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleMove(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleEnd(e.changedTouches[0]);
        });
    }
    
    handleStart(e) {
        if (this.state !== GameState.PLAYING || this.heart !== null) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 允许在屏幕任意位置开始瞄准，更方便操作
        this.isAiming = true;
        this.aimStartX = x;
        this.aimStartY = y;
        this.aimEndX = x;
        this.aimEndY = y;
    }
    
    handleMove(e) {
        if (!this.isAiming) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.aimEndX = e.clientX - rect.left;
        this.aimEndY = e.clientY - rect.top;
        
        // 更新轨迹预测
        this.updateTrajectoryPreview();
        
        // 更新UI显示
        this.updateAimUI();
    }
    
    handleEnd(e) {
        if (!this.isAiming) return;
        
        this.isAiming = false;
        this.launchHeart();
    }
    
    updateTrajectoryPreview() {
        this.trajectoryPoints = [];
        
        const dx = this.aimStartX - this.aimEndX;
        const dy = this.aimStartY - this.aimEndY;
        const power = Math.min(Math.sqrt(dx * dx + dy * dy) / 3, 20);
        
        // 大幅提高速度，让发射更灵敏
        let vx = dx / 3;  // 从 /10 改为 /3，速度提升3倍多
        let vy = dy / 3;
        
        let px = this.launcher.x;
        let py = this.launcher.y;
        
        // 预测轨迹（最多100步）
        for (let i = 0; i < 100; i++) {
            this.trajectoryPoints.push({ x: px, y: py });
            
            px += vx;
            py += vy;
            vy += this.gravity;
            
            // 如果超出屏幕，停止预测
            if (py > this.canvas.height || px > this.canvas.width || px < 0) {
                break;
            }
        }
    }
    
    updateAimUI() {
        const dx = this.aimStartX - this.aimEndX;
        const dy = this.aimStartY - this.aimEndY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const power = Math.min(distance / 2, 100);  // 调整力度显示范围
        const angle = Math.atan2(-dy, dx) * 180 / Math.PI;
        
        document.getElementById('angle-display').textContent = Math.round(angle) + '°';
        document.getElementById('power-display').textContent = Math.round(power) + '%';
    }
    
    launchHeart() {
        const dx = this.aimStartX - this.aimEndX;
        const dy = this.aimStartY - this.aimEndY;
        
        // 检查拖拽距离，太小就不发射
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 10) {
            this.isAiming = false;
            return;  // 拖拽距离太小，取消发射
        }
        
        this.heart = {
            x: this.launcher.x,
            y: this.launcher.y,
            vx: dx / 3,  // 从 /10 改为 /3，速度提升3倍多
            vy: dy / 3,
            radius: 15,
            rotation: 0,
            trail: []
        };
        
        this.trajectoryPoints = [];
        this.heartsLeft--;
        this.updateUI();
    }
    
    startGame() {
        console.log('开始游戏被调用！');
        this.currentLevel = 1;
        this.score = 0;
        this.heartsLeft = 3;
        this.state = GameState.PLAYING;
        this.showScreen('game-screen');
        
        // 等待屏幕切换完成后再初始化canvas和关卡
        setTimeout(() => {
            console.log('Canvas尺寸:', this.canvas.width, 'x', this.canvas.height);
            this.resizeCanvas();
            console.log('调整后Canvas尺寸:', this.canvas.width, 'x', this.canvas.height);
            this.loadLevel(1);
            this.gameLoop();
        }, 100);
    }
    
    loadLevel(level) {
        const levelData = this.levels[level - 1];
        
        // 设置目标位置
        this.target = {
            x: levelData.target.x * this.canvas.width,
            y: levelData.target.y * this.canvas.height,
            radius: 40,
            hit: false,
            moving: levelData.target.moving || false,
            speed: levelData.target.speed || 0,
            range: levelData.target.range || 0,
            startY: levelData.target.y * this.canvas.height,
            direction: 1
        };
        
        // 设置障碍物
        this.obstacles = levelData.obstacles.map(obs => ({
            x: obs.x * this.canvas.width,
            y: obs.y * this.canvas.height,
            width: obs.width,
            height: obs.height,
            type: obs.type
        }));
        
        this.heart = null;
        this.updateUI();
    }
    
    nextLevel() {
        this.currentLevel++;
        
        if (this.currentLevel > this.maxLevel) {
            this.victory();
        } else {
            this.heartsLeft = 3;
            this.state = GameState.PLAYING;
            this.showScreen('game-screen');
            
            setTimeout(() => {
                this.resizeCanvas();
                this.loadLevel(this.currentLevel);
                this.gameLoop();
            }, 100);
        }
    }
    
    resetLevel() {
        this.heartsLeft = 3;
        this.loadLevel(this.currentLevel);
    }
    
    restartGame() {
        this.currentLevel = 1;
        this.score = 0;
        this.heartsLeft = 3;
        this.state = GameState.PLAYING;
        this.showScreen('game-screen');
        
        setTimeout(() => {
            this.resizeCanvas();
            this.loadLevel(1);
            this.gameLoop();
        }, 100);
    }
    
    backToMenu() {
        this.state = GameState.MENU;
        this.showScreen('start-screen');
    }
    
    victory() {
        this.state = GameState.VICTORY;
        document.getElementById('victory-score').textContent = this.score;
        
        // 计算星级
        const stars = this.calculateStars(this.score);
        document.getElementById('victory-stars').textContent = '⭐'.repeat(stars);
        
        this.showScreen('victory-screen');
    }
    
    gameOver() {
        this.state = GameState.GAME_OVER;
        document.getElementById('failed-level').textContent = this.currentLevel;
        document.getElementById('final-score').textContent = this.score;
        this.showScreen('game-over-screen');
    }
    
    levelComplete() {
        this.state = GameState.LEVEL_COMPLETE;
        
        const levelScore = 1000 + this.heartsLeft * 500;
        this.score += levelScore;
        
        document.getElementById('level-score').textContent = levelScore;
        document.getElementById('total-score').textContent = this.score;
        
        const stars = this.heartsLeft;
        document.getElementById('stars-earned').textContent = '⭐'.repeat(stars);
        
        this.showScreen('level-complete-screen');
    }
    
    calculateStars(score) {
        if (score >= 20000) return 5;
        if (score >= 15000) return 4;
        if (score >= 10000) return 3;
        if (score >= 5000) return 2;
        return 1;
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    updateUI() {
        document.getElementById('current-level').textContent = this.currentLevel;
        document.getElementById('hearts-left').textContent = this.heartsLeft;
        document.getElementById('score').textContent = this.score;
    }
    
    gameLoop() {
        if (this.state !== GameState.PLAYING) return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // 更新移动目标
        if (this.target.moving) {
            this.target.y += this.target.speed * this.target.direction;
            
            if (this.target.y > this.target.startY + this.target.range) {
                this.target.direction = -1;
            } else if (this.target.y < this.target.startY - this.target.range) {
                this.target.direction = 1;
            }
        }
        
        // 更新爱心
        if (this.heart) {
            this.heart.x += this.heart.vx;
            this.heart.y += this.heart.vy;
            this.heart.vy += this.gravity;
            this.heart.rotation += 0.1;
            
            // 添加轨迹
            this.heart.trail.push({ x: this.heart.x, y: this.heart.y });
            if (this.heart.trail.length > 20) {
                this.heart.trail.shift();
            }
            
            // 检查碰撞目标
            const dx = this.heart.x - this.target.x;
            const dy = this.heart.y - this.target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.heart.radius + this.target.radius) {
                this.target.hit = true;
                this.createParticles(this.target.x, this.target.y, 30);
                this.heart = null;
                setTimeout(() => this.levelComplete(), 1000);
            }
            
            // 检查碰撞障碍物
            for (let obs of this.obstacles) {
                if (this.heart.x > obs.x && 
                    this.heart.x < obs.x + obs.width &&
                    this.heart.y > obs.y && 
                    this.heart.y < obs.y + obs.height) {
                    this.heart = null;
                    this.createParticles(this.heart?.x || obs.x, this.heart?.y || obs.y, 10);
                    break;
                }
            }
            
            // 检查出界
            if (this.heart && (this.heart.y > this.canvas.height || 
                this.heart.x > this.canvas.width || 
                this.heart.x < 0)) {
                this.heart = null;
            }
            
            // 检查是否用完所有爱心
            if (!this.heart && this.heartsLeft === 0 && !this.target.hit) {
                setTimeout(() => this.gameOver(), 500);
            }
        }
        
        // 更新粒子
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.life--;
            return p.life > 0;
        });
    }
    
    render() {
        // 清空画布
        this.ctx.fillStyle = '#fef9f3';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制装饰性背景
        this.drawBackground();
        
        // 绘制障碍物
        this.obstacles.forEach(obs => {
            this.ctx.fillStyle = '#8b7fb8';
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            
            // 添加阴影效果
            this.ctx.strokeStyle = '#6b5f98';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        });
        
        // 绘制目标
        this.drawTarget();
        
        // 绘制发射器
        this.drawLauncher();
        
        // 绘制轨迹预测
        if (this.isAiming && this.trajectoryPoints.length > 0) {
            this.ctx.strokeStyle = 'rgba(255, 107, 157, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.trajectoryPoints[0].x, this.trajectoryPoints[0].y);
            this.trajectoryPoints.forEach(point => {
                this.ctx.lineTo(point.x, point.y);
            });
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
        
        // 绘制瞄准线
        if (this.isAiming) {
            this.ctx.strokeStyle = '#ff6b9d';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(this.launcher.x, this.launcher.y);
            this.ctx.lineTo(this.aimEndX, this.aimEndY);
            this.ctx.stroke();
        }
        
        // 绘制飞行中的爱心
        if (this.heart) {
            // 绘制轨迹
            this.heart.trail.forEach((point, index) => {
                const alpha = index / this.heart.trail.length;
                this.ctx.fillStyle = `rgba(255, 107, 157, ${alpha * 0.5})`;
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, this.heart.radius * 0.5, 0, Math.PI * 2);
                this.ctx.fill();
            });
            
            this.drawHeart(this.heart.x, this.heart.y, this.heart.radius, this.heart.rotation);
        }
        
        // 绘制粒子
        this.particles.forEach(p => {
            const alpha = p.life / 30;
            this.ctx.fillStyle = `rgba(255, 107, 157, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawBackground() {
        // 绘制一些装饰性的小爱心
        for (let i = 0; i < 5; i++) {
            const x = (i * 0.2 + 0.1) * this.canvas.width;
            const y = (Math.sin(Date.now() / 1000 + i) * 0.05 + 0.1) * this.canvas.height;
            this.ctx.globalAlpha = 0.1;
            this.drawHeart(x, y, 15, 0);
            this.ctx.globalAlpha = 1;
        }
    }
    
    drawLauncher() {
        // 绘制底座
        this.ctx.fillStyle = '#ff8fab';
        this.ctx.beginPath();
        this.ctx.arc(this.launcher.x, this.launcher.y, this.launcher.radius + 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制爱心发射器
        this.drawHeart(this.launcher.x, this.launcher.y, this.launcher.radius, 0);
    }
    
    drawTarget() {
        if (this.target.hit) {
            // 目标被击中的特效
            this.ctx.globalAlpha = 0.5;
        }
        
        // 绘制目标光环
        this.ctx.strokeStyle = '#ff6b9d';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(this.target.x, this.target.y, this.target.radius + 10, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 绘制目标
        this.ctx.fillStyle = '#ffb3d9';
        this.ctx.beginPath();
        this.ctx.arc(this.target.x, this.target.y, this.target.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制目标中心的爱心
        this.drawHeart(this.target.x, this.target.y, this.target.radius * 0.6, 0);
        
        this.ctx.globalAlpha = 1;
    }
    
    drawHeart(x, y, size, rotation) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        
        this.ctx.fillStyle = '#ff6b9d';
        this.ctx.beginPath();
        this.ctx.moveTo(0, size / 4);
        
        // 左半边
        this.ctx.bezierCurveTo(-size, -size / 2, -size, -size, -size / 4, -size);
        this.ctx.bezierCurveTo(0, -size, 0, -size / 2, 0, size / 4);
        
        // 右半边
        this.ctx.bezierCurveTo(0, -size / 2, 0, -size, size / 4, -size);
        this.ctx.bezierCurveTo(size, -size, size, -size / 2, 0, size / 4);
        
        this.ctx.fill();
        
        // 添加高光
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(-size / 4, -size / 2, size / 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    createParticles(x, y, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 5 + 2,
                life: 30
            });
        }
    }
}

// 启动游戏
let game;
console.log('游戏脚本已加载');

window.addEventListener('load', () => {
    console.log('页面加载完成，开始初始化游戏...');
    try {
        game = new Game();
        console.log('游戏初始化成功！', game);
    } catch (error) {
        console.error('游戏初始化失败:', error);
    }
});

