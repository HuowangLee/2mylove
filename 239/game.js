// 游戏常量
const BALL_RADIUS = 15;
const PATH_WIDTH = 8;
const HEART_SIZE = 20;
const TARGET_RADIUS = 30;
const BALL_SPEED = 3;
const MIN_PATH_LENGTH = 10;

// 游戏状态
const GameState = {
    START: 'start',
    DRAWING: 'drawing',
    MOVING: 'moving',
    COMPLETE: 'complete'
};

// 游戏类
class DrawToMoveGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 初始化画布大小
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 游戏变量
        this.currentLevel = 0;
        this.gameState = GameState.START;
        this.drawnPath = [];
        this.ball = null;
        this.currentPathIndex = 0;
        this.collectedHearts = [];
        
        // 关卡配置
        this.levels = this.generateLevels();
        
        // 绑定事件
        this.bindEvents();
        
        // 显示开始界面
        document.getElementById('startScreen').classList.remove('hidden');
    }
    
    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        const maxWidth = Math.min(window.innerWidth - 20, 600);
        const maxHeight = window.innerHeight - 200;
        
        // 保持合适的宽高比
        if (window.innerHeight > window.innerWidth) {
            // 竖屏
            this.canvas.width = maxWidth;
            this.canvas.height = Math.min(maxHeight, maxWidth * 1.3);
        } else {
            // 横屏
            this.canvas.width = maxWidth;
            this.canvas.height = Math.min(maxHeight, maxWidth * 0.7);
        }
    }
    
    generateLevels() {
        const levels = [];
        
        // 关卡1：简单直线 - 无障碍，适应游戏
        levels.push({
            start: { x: 0.2, y: 0.5 },
            target: { x: 0.8, y: 0.5 },
            hearts: [
                { x: 0.4, y: 0.5 },
                { x: 0.5, y: 0.5 },
                { x: 0.6, y: 0.5 }
            ],
            obstacles: []
        });
        
        // 关卡2：简单曲线 - 无障碍
        levels.push({
            start: { x: 0.2, y: 0.3 },
            target: { x: 0.8, y: 0.7 },
            hearts: [
                { x: 0.35, y: 0.35 },
                { x: 0.5, y: 0.5 },
                { x: 0.65, y: 0.65 }
            ],
            obstacles: []
        });
        
        // 关卡3：带单个障碍 - 爱心分布在障碍物周围
        levels.push({
            start: { x: 0.15, y: 0.2 },
            target: { x: 0.85, y: 0.8 },
            hearts: [
                { x: 0.25, y: 0.4 },  // 障碍物左侧
                { x: 0.5, y: 0.25 },  // 障碍物上方
                { x: 0.75, y: 0.6 }   // 障碍物右侧
            ],
            obstacles: [
                { x: 0.42, y: 0.45, width: 0.16, height: 0.16 }  // 中央障碍物
            ]
        });
        
        // 关卡4：双障碍横条 - Z字形路径
        levels.push({
            start: { x: 0.15, y: 0.15 },
            target: { x: 0.85, y: 0.85 },
            hearts: [
                { x: 0.7, y: 0.25 },  // 上方通道
                { x: 0.3, y: 0.5 },   // 中间通道
                { x: 0.7, y: 0.75 }   // 下方通道
            ],
            obstacles: [
                { x: 0.25, y: 0.35, width: 0.35, height: 0.08 },  // 上横条
                { x: 0.4, y: 0.60, width: 0.35, height: 0.08 }    // 下横条
            ]
        });
        
        // 关卡5：迷宫式 - 复杂路径规划
        levels.push({
            start: { x: 0.15, y: 0.15 },
            target: { x: 0.85, y: 0.85 },
            hearts: [
                { x: 0.25, y: 0.25 },  // 左上角
                { x: 0.75, y: 0.45 },  // 右侧通道
                { x: 0.25, y: 0.75 }   // 左下角
            ],
            obstacles: [
                { x: 0.35, y: 0.15, width: 0.08, height: 0.35 },  // 左竖条
                { x: 0.57, y: 0.5, width: 0.08, height: 0.35 }    // 右竖条
            ]
        });
        
        // 关卡6：多障碍散布 - 需要精确规划
        levels.push({
            start: { x: 0.1, y: 0.5 },
            target: { x: 0.9, y: 0.5 },
            hearts: [
                { x: 0.3, y: 0.3 },   // 上方
                { x: 0.5, y: 0.7 },   // 下方
                { x: 0.7, y: 0.3 },   // 上方
                { x: 0.8, y: 0.6 }    // 右侧
            ],
            obstacles: [
                { x: 0.22, y: 0.42, width: 0.12, height: 0.16 },  // 左侧
                { x: 0.42, y: 0.25, width: 0.12, height: 0.16 },  // 中上
                { x: 0.62, y: 0.42, width: 0.12, height: 0.16 }   // 右侧
            ]
        });
        
        // 关卡7：狭窄通道 - 考验精准度
        levels.push({
            start: { x: 0.15, y: 0.2 },
            target: { x: 0.85, y: 0.8 },
            hearts: [
                { x: 0.5, y: 0.2 },   // 上通道
                { x: 0.3, y: 0.5 },   // 中间通道
                { x: 0.7, y: 0.5 },   // 中间通道
                { x: 0.5, y: 0.8 }    // 下通道
            ],
            obstacles: [
                { x: 0.15, y: 0.32, width: 0.35, height: 0.08 },  // 左上横条
                { x: 0.5, y: 0.32, width: 0.35, height: 0.08 },   // 右上横条
                { x: 0.15, y: 0.6, width: 0.35, height: 0.08 },   // 左下横条
                { x: 0.5, y: 0.6, width: 0.35, height: 0.08 }     // 右下横条
            ]
        });
        
        // 关卡8：螺旋迷宫 - 需要迂回路径
        levels.push({
            start: { x: 0.15, y: 0.15 },
            target: { x: 0.5, y: 0.5 },
            hearts: [
                { x: 0.8, y: 0.15 },  // 右上
                { x: 0.8, y: 0.85 },  // 右下
                { x: 0.2, y: 0.85 },  // 左下
                { x: 0.35, y: 0.5 }   // 中心附近
            ],
            obstacles: [
                { x: 0.28, y: 0.1, width: 0.08, height: 0.35 },   // 左竖条
                { x: 0.28, y: 0.55, width: 0.44, height: 0.08 },  // 下横条
                { x: 0.64, y: 0.28, width: 0.08, height: 0.35 },  // 右竖条
                { x: 0.44, y: 0.28, width: 0.28, height: 0.08 }   // 上横条
            ]
        });
        
        // 关卡9：十字路口 - 复杂交叉
        levels.push({
            start: { x: 0.1, y: 0.5 },
            target: { x: 0.9, y: 0.5 },
            hearts: [
                { x: 0.3, y: 0.2 },   // 左上
                { x: 0.7, y: 0.2 },   // 右上
                { x: 0.3, y: 0.8 },   // 左下
                { x: 0.7, y: 0.8 },   // 右下
                { x: 0.5, y: 0.5 }    // 中心
            ],
            obstacles: [
                { x: 0.2, y: 0.36, width: 0.18, height: 0.08 },   // 左上横
                { x: 0.62, y: 0.36, width: 0.18, height: 0.08 },  // 右上横
                { x: 0.2, y: 0.56, width: 0.18, height: 0.08 },   // 左下横
                { x: 0.62, y: 0.56, width: 0.18, height: 0.08 },  // 右下横
                { x: 0.46, y: 0.2, width: 0.08, height: 0.16 },   // 上竖
                { x: 0.46, y: 0.64, width: 0.08, height: 0.16 }   // 下竖
            ]
        });
        
        // 关卡10：终极挑战 - 239的极限考验
        levels.push({
            start: { x: 0.1, y: 0.1 },
            target: { x: 0.9, y: 0.9 },
            hearts: [
                { x: 0.25, y: 0.15 },  // 左上角外
                { x: 0.75, y: 0.15 },  // 右上角外
                { x: 0.15, y: 0.5 },   // 左侧外
                { x: 0.85, y: 0.5 },   // 右侧外
                { x: 0.5, y: 0.75 },   // 下方中心
                { x: 0.75, y: 0.85 }   // 右下角附近
            ],
            obstacles: [
                // 上方围墙
                { x: 0.32, y: 0.22, width: 0.36, height: 0.08 },
                // 左侧L形
                { x: 0.22, y: 0.3, width: 0.08, height: 0.28 },
                { x: 0.3, y: 0.5, width: 0.2, height: 0.08 },
                // 右侧倒L形
                { x: 0.7, y: 0.3, width: 0.08, height: 0.28 },
                { x: 0.5, y: 0.5, width: 0.2, height: 0.08 },
                // 下方障碍
                { x: 0.32, y: 0.65, width: 0.12, height: 0.08 },
                { x: 0.56, y: 0.65, width: 0.12, height: 0.08 }
            ]
        });
        
        return levels;
    }
    
    bindEvents() {
        // 开始游戏按钮
        document.getElementById('playBtn').addEventListener('click', () => {
            document.getElementById('startScreen').classList.add('hidden');
            this.startLevel();
        });
        
        // 清除路径按钮
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearPath();
        });
        
        // 开始移动按钮
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startMoving();
        });
        
        // 重新开始按钮
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetLevel();
        });
        
        // 下一关按钮
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            document.getElementById('levelCompleteScreen').classList.add('hidden');
            this.currentLevel++;
            if (this.currentLevel >= this.levels.length) {
                this.showGameComplete();
            } else {
                this.startLevel();
            }
        });
        
        // 重新游戏按钮
        document.getElementById('replayBtn').addEventListener('click', () => {
            document.getElementById('gameCompleteScreen').classList.add('hidden');
            this.currentLevel = 0;
            this.startLevel();
        });
        
        // 绘制路径事件
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // 鼠标事件（用于测试）
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }
    
    startLevel() {
        this.gameState = GameState.START;
        this.drawnPath = [];
        this.collectedHearts = [];
        this.currentPathIndex = 0;
        
        const level = this.levels[this.currentLevel];
        
        // 初始化小球位置
        this.ball = {
            x: level.start.x * this.canvas.width,
            y: level.start.y * this.canvas.height
        };
        
        // 更新UI
        document.getElementById('currentLevel').textContent = this.currentLevel + 1;
        document.getElementById('heartsCollected').textContent = '0';
        document.getElementById('totalHearts').textContent = level.hearts.length;
        
        // 启用/禁用按钮
        this.updateButtons();
        
        // 开始渲染循环
        this.animate();
    }
    
    clearPath() {
        this.drawnPath = [];
        this.updateButtons();
    }
    
    resetLevel() {
        this.gameState = GameState.START;
        this.drawnPath = [];
        this.collectedHearts = [];
        this.currentPathIndex = 0;
        
        const level = this.levels[this.currentLevel];
        this.ball = {
            x: level.start.x * this.canvas.width,
            y: level.start.y * this.canvas.height
        };
        
        document.getElementById('heartsCollected').textContent = '0';
        this.updateButtons();
    }
    
    startMoving() {
        if (this.drawnPath.length < MIN_PATH_LENGTH) {
            return;
        }
        
        this.gameState = GameState.MOVING;
        this.currentPathIndex = 0;
        this.updateButtons();
    }
    
    updateButtons() {
        const clearBtn = document.getElementById('clearBtn');
        const startBtn = document.getElementById('startBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        if (this.gameState === GameState.MOVING) {
            clearBtn.disabled = true;
            startBtn.disabled = true;
            resetBtn.disabled = false;
        } else {
            clearBtn.disabled = this.drawnPath.length === 0;
            startBtn.disabled = this.drawnPath.length < MIN_PATH_LENGTH;
            resetBtn.disabled = false;
        }
    }
    
    // 触摸事件处理
    handleTouchStart(e) {
        e.preventDefault();
        if (this.gameState !== GameState.START) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.gameState = GameState.DRAWING;
        this.drawnPath = [{ x, y }];
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        if (this.gameState !== GameState.DRAWING) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        const lastPoint = this.drawnPath[this.drawnPath.length - 1];
        const distance = Math.hypot(x - lastPoint.x, y - lastPoint.y);
        
        if (distance > 5) {
            this.drawnPath.push({ x, y });
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        if (this.gameState === GameState.DRAWING) {
            this.gameState = GameState.START;
            this.updateButtons();
        }
    }
    
    // 鼠标事件处理
    handleMouseDown(e) {
        if (this.gameState !== GameState.START) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.gameState = GameState.DRAWING;
        this.drawnPath = [{ x, y }];
    }
    
    handleMouseMove(e) {
        if (this.gameState !== GameState.DRAWING) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const lastPoint = this.drawnPath[this.drawnPath.length - 1];
        const distance = Math.hypot(x - lastPoint.x, y - lastPoint.y);
        
        if (distance > 5) {
            this.drawnPath.push({ x, y });
        }
    }
    
    handleMouseUp(e) {
        if (this.gameState === GameState.DRAWING) {
            this.gameState = GameState.START;
            this.updateButtons();
        }
    }
    
    // 更新游戏逻辑
    update() {
        if (this.gameState !== GameState.MOVING) return;
        
        const level = this.levels[this.currentLevel];
        
        // 沿路径移动小球
        if (this.currentPathIndex < this.drawnPath.length - 1) {
            const current = this.drawnPath[this.currentPathIndex];
            const next = this.drawnPath[this.currentPathIndex + 1];
            
            const dx = next.x - this.ball.x;
            const dy = next.y - this.ball.y;
            const distance = Math.hypot(dx, dy);
            
            if (distance < BALL_SPEED) {
                this.currentPathIndex++;
            } else {
                this.ball.x += (dx / distance) * BALL_SPEED;
                this.ball.y += (dy / distance) * BALL_SPEED;
            }
            
            // 检查是否碰到障碍物
            for (const obstacle of level.obstacles) {
                const obstacleX = obstacle.x * this.canvas.width;
                const obstacleY = obstacle.y * this.canvas.height;
                const obstacleWidth = obstacle.width * this.canvas.width;
                const obstacleHeight = obstacle.height * this.canvas.height;
                
                if (this.ball.x + BALL_RADIUS > obstacleX &&
                    this.ball.x - BALL_RADIUS < obstacleX + obstacleWidth &&
                    this.ball.y + BALL_RADIUS > obstacleY &&
                    this.ball.y - BALL_RADIUS < obstacleY + obstacleHeight) {
                    // 碰到障碍物，重置
                    this.resetLevel();
                    return;
                }
            }
            
            // 检查是否收集到爱心
            for (let i = 0; i < level.hearts.length; i++) {
                if (this.collectedHearts.includes(i)) continue;
                
                const heart = level.hearts[i];
                const heartX = heart.x * this.canvas.width;
                const heartY = heart.y * this.canvas.height;
                
                const distance = Math.hypot(this.ball.x - heartX, this.ball.y - heartY);
                if (distance < BALL_RADIUS + HEART_SIZE / 2) {
                    this.collectedHearts.push(i);
                    document.getElementById('heartsCollected').textContent = this.collectedHearts.length;
                    
                    // 添加收集动画效果
                    this.createCollectEffect(heartX, heartY);
                }
            }
        } else {
            // 路径结束，检查是否到达目标
            const targetX = level.target.x * this.canvas.width;
            const targetY = level.target.y * this.canvas.height;
            const distance = Math.hypot(this.ball.x - targetX, this.ball.y - targetY);
            
            if (distance < TARGET_RADIUS) {
                // 检查是否收集了所有爱心
                if (this.collectedHearts.length === level.hearts.length) {
                    this.levelComplete();
                } else {
                    // 没有收集所有爱心，重置
                    this.resetLevel();
                }
            } else {
                // 没有到达目标，重置
                this.resetLevel();
            }
        }
    }
    
    createCollectEffect(x, y) {
        // 简单的收集效果（可以扩展）
        console.log(`收集爱心：${x}, ${y}`);
    }
    
    levelComplete() {
        this.gameState = GameState.COMPLETE;
        document.getElementById('levelCompleteScreen').classList.remove('hidden');
    }
    
    showGameComplete() {
        document.getElementById('gameCompleteScreen').classList.remove('hidden');
    }
    
    // 渲染
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const level = this.levels[this.currentLevel];
        
        // 绘制障碍物
        this.ctx.fillStyle = '#ffb3c1';
        for (const obstacle of level.obstacles) {
            const x = obstacle.x * this.canvas.width;
            const y = obstacle.y * this.canvas.height;
            const width = obstacle.width * this.canvas.width;
            const height = obstacle.height * this.canvas.height;
            
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, width, height, 10);
            this.ctx.fill();
            
            // 添加阴影效果
            this.ctx.strokeStyle = '#ff8fa3';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
        
        // 绘制目标点
        const targetX = level.target.x * this.canvas.width;
        const targetY = level.target.y * this.canvas.height;
        
        // 目标点光环效果
        const gradient = this.ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, TARGET_RADIUS);
        gradient.addColorStop(0, 'rgba(255, 107, 157, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 107, 157, 0.1)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(targetX, targetY, TARGET_RADIUS, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 目标点图标
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🎯', targetX, targetY);
        
        // 绘制爱心
        for (let i = 0; i < level.hearts.length; i++) {
            if (this.collectedHearts.includes(i)) continue;
            
            const heart = level.hearts[i];
            const x = heart.x * this.canvas.width;
            const y = heart.y * this.canvas.height;
            
            this.ctx.font = `${HEART_SIZE}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // 添加跳动效果
            const scale = 1 + Math.sin(Date.now() / 200 + i) * 0.1;
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.scale(scale, scale);
            this.ctx.fillText('💖', 0, 0);
            this.ctx.restore();
        }
        
        // 绘制已画的路径
        if (this.drawnPath.length > 1) {
            this.ctx.strokeStyle = '#ff6b9d';
            this.ctx.lineWidth = PATH_WIDTH;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            // 添加阴影
            this.ctx.shadowColor = 'rgba(255, 107, 157, 0.5)';
            this.ctx.shadowBlur = 10;
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.drawnPath[0].x, this.drawnPath[0].y);
            for (let i = 1; i < this.drawnPath.length; i++) {
                this.ctx.lineTo(this.drawnPath[i].x, this.drawnPath[i].y);
            }
            this.ctx.stroke();
            
            // 重置阴影
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
        }
        
        // 绘制小球
        const gradient2 = this.ctx.createRadialGradient(
            this.ball.x - 5, this.ball.y - 5, 0,
            this.ball.x, this.ball.y, BALL_RADIUS
        );
        gradient2.addColorStop(0, '#ff8fab');
        gradient2.addColorStop(1, '#ff6b9d');
        
        this.ctx.fillStyle = gradient2;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, BALL_RADIUS, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 小球边框
        this.ctx.strokeStyle = '#ff4d7d';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // 小球中心爱心
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('💕', this.ball.x, this.ball.y);
        
        // 绘制起点标记（半透明）
        const startX = level.start.x * this.canvas.width;
        const startY = level.start.y * this.canvas.height;
        this.ctx.globalAlpha = 0.5;
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#ff6b9d';
        this.ctx.fillText('起点', startX, startY - 30);
        this.ctx.globalAlpha = 1.0;
    }
    
    animate() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}

// 初始化游戏
window.addEventListener('load', () => {
    new DrawToMoveGame();
});

