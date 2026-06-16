// 游戏配置
const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 700,
    PLAYER_WIDTH: 30,
    PLAYER_HEIGHT: 30,
    PLATFORM_WIDTH: 120,
    PLATFORM_HEIGHT: 15,
    GRAVITY: 0.4,
    JUMP_STRENGTH: -13,
    MOVE_SPEED: 5,
    MAX_FLOORS: 224,
    PLATFORM_GAP: 70, // 垂直间距
    PLATFORMS_PER_SCREEN: 6
};

// 游戏状态
let gameState = {
    player: null,
    platforms: [],
    keys: {},
    currentFloor: 0,
    highestFloor: 0,
    camera: { y: 0 },
    gameStartTime: null,
    isGameWon: false
};

// Canvas设置
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = CONFIG.CANVAS_WIDTH;
canvas.height = CONFIG.CANVAS_HEIGHT;

// 玩家类
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.PLAYER_WIDTH;
        this.height = CONFIG.PLAYER_HEIGHT;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.color = '#667eea';
    }

    update() {
        // 水平移动
        if (gameState.keys['ArrowLeft']) {
            this.velocityX = -CONFIG.MOVE_SPEED;
        } else if (gameState.keys['ArrowRight']) {
            this.velocityX = CONFIG.MOVE_SPEED;
        } else {
            this.velocityX = 0;
        }

        // 应用重力
        this.velocityY += CONFIG.GRAVITY;

        // 更新位置
        this.x += this.velocityX;
        this.y += this.velocityY;

        // 边界检测
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > CONFIG.CANVAS_WIDTH) {
            this.x = CONFIG.CANVAS_WIDTH - this.width;
        }

        // 防止掉出底部
        if (this.y > CONFIG.CANVAS_HEIGHT + 1000) {
            this.respawn();
        }

        // 平台碰撞检测
        this.checkPlatformCollision();
    }

    checkPlatformCollision() {
        for (let platform of gameState.platforms) {
            if (this.velocityY > 0 && // 只在下落时检测
                this.y + this.height >= platform.y &&
                this.y + this.height <= platform.y + platform.height + this.velocityY &&
                this.x + this.width > platform.x &&
                this.x < platform.x + platform.width) {
                
                this.y = platform.y - this.height;
                this.velocityY = 0;
                this.isJumping = false;

                // 更新楼层
                if (platform.floor > gameState.highestFloor) {
                    gameState.highestFloor = platform.floor;
                    gameState.currentFloor = platform.floor;
                    updateUI();

                    // 检查胜利条件
                    if (gameState.currentFloor >= CONFIG.MAX_FLOORS && !gameState.isGameWon) {
                        winGame();
                    }
                }
            }
        }
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = CONFIG.JUMP_STRENGTH;
            this.isJumping = true;
        }
    }

    respawn() {
        // 重生到最近的平台
        let respawnPlatform = gameState.platforms.find(p => p.floor === Math.max(0, gameState.currentFloor - 1));
        if (respawnPlatform) {
            this.x = respawnPlatform.x + respawnPlatform.width / 2 - this.width / 2;
            this.y = respawnPlatform.y - this.height - 10;
        } else {
            this.x = CONFIG.CANVAS_WIDTH / 2 - this.width / 2;
            this.y = CONFIG.CANVAS_HEIGHT - 100;
        }
        this.velocityY = 0;
        this.isJumping = false;
    }

    draw() {
        // 玩家身体
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y - gameState.camera.y, this.width, this.height);
        
        // 玩家眼睛
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 8, this.y - gameState.camera.y + 8, 6, 6);
        ctx.fillRect(this.x + 16, this.y - gameState.camera.y + 8, 6, 6);
        
        // 玩家嘴巴
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 10, this.y - gameState.camera.y + 20, 10, 3);
    }
}

// 平台类
class Platform {
    constructor(x, y, floor) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.PLATFORM_WIDTH;
        this.height = CONFIG.PLATFORM_HEIGHT;
        this.floor = floor;
        this.color = this.getColorByFloor(floor);
    }

    getColorByFloor(floor) {
        // 根据楼层高度改变颜色
        const hue = (floor * 1.6) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }

    draw() {
        const screenY = this.y - gameState.camera.y;
        
        // 只绘制在屏幕内的平台
        if (screenY > -this.height && screenY < CONFIG.CANVAS_HEIGHT + this.height) {
            // 平台主体
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, screenY, this.width, this.height);
            
            // 平台边框
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, screenY, this.width, this.height);
            
            // 楼层数字
            if (this.floor > 0 && this.floor % 10 === 0) {
                ctx.fillStyle = 'white';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`${this.floor}层`, this.x + this.width / 2, screenY + this.height / 2 + 4);
            }
        }
    }
}

// 初始化游戏
function initGame() {
    gameState.player = new Player(CONFIG.CANVAS_WIDTH / 2 - CONFIG.PLAYER_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 100);
    gameState.platforms = [];
    gameState.currentFloor = 0;
    gameState.highestFloor = 0;
    gameState.camera.y = 0;
    gameState.isGameWon = false;
    gameState.gameStartTime = Date.now();

    // 创建起始平台
    gameState.platforms.push(new Platform(
        CONFIG.CANVAS_WIDTH / 2 - CONFIG.PLATFORM_WIDTH / 2,
        CONFIG.CANVAS_HEIGHT - 50,
        0
    ));

    // 生成所有平台
    for (let i = 1; i <= CONFIG.MAX_FLOORS; i++) {
        createPlatform(i);
    }

    updateUI();
}

// 创建平台
function createPlatform(floor) {
    let x;
    const y = CONFIG.CANVAS_HEIGHT - 50 - (floor * CONFIG.PLATFORM_GAP);
    
    // 获取上一个平台的位置
    const previousPlatform = gameState.platforms.find(p => p.floor === floor - 1);
    
    if (previousPlatform) {
        // 在上一个平台附近生成新平台，确保可以跳到
        const maxDistance = 250; // 最大水平距离
        const minDistance = 50;  // 最小距离，避免太近
        
        // 随机选择左边或右边
        const direction = Math.random() > 0.5 ? 1 : -1;
        const distance = minDistance + Math.random() * (maxDistance - minDistance);
        x = previousPlatform.x + (direction * distance);
        
        // 确保平台在画布内
        x = Math.max(0, Math.min(CONFIG.CANVAS_WIDTH - CONFIG.PLATFORM_WIDTH, x));
    } else {
        // 第一个平台随机位置
        x = Math.random() * (CONFIG.CANVAS_WIDTH - CONFIG.PLATFORM_WIDTH);
    }
    
    gameState.platforms.push(new Platform(x, y, floor));
}

// 更新相机位置
function updateCamera() {
    const playerScreenY = gameState.player.y - gameState.camera.y;
    
    // 当玩家到达屏幕中上部分时，平滑移动相机
    const targetY = CONFIG.CANVAS_HEIGHT * 0.6; // 保持玩家在屏幕60%的位置
    
    if (playerScreenY < targetY) {
        // 相机需要向上移动（减小y值）
        const desiredCameraY = gameState.player.y - targetY;
        
        // 只允许相机向上移动，不允许向下移动
        if (desiredCameraY < gameState.camera.y) {
            gameState.camera.y = desiredCameraY;
        }
    }
}

// 更新UI
function updateUI() {
    document.getElementById('currentFloor').textContent = gameState.currentFloor;
    const progress = Math.min(100, (gameState.currentFloor / CONFIG.MAX_FLOORS * 100).toFixed(1));
    document.getElementById('progress').textContent = progress + '%';
}

// 游戏胜利
function winGame() {
    gameState.isGameWon = true;
    const completionTime = Math.floor((Date.now() - gameState.gameStartTime) / 1000);
    document.getElementById('completionTime').textContent = completionTime;
    
    setTimeout(() => {
        document.getElementById('victoryModal').classList.add('active');
    }, 500);
}

// 游戏主循环
function gameLoop() {
    // 清空画布
    ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // 绘制背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
    gradient.addColorStop(0, '#e0f7ff');
    gradient.addColorStop(1, '#ffffff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    if (!gameState.isGameWon) {
        // 更新游戏状态
        gameState.player.update();
        updateCamera();
    }

    // 绘制平台
    for (let platform of gameState.platforms) {
        platform.draw();
    }

    // 绘制玩家
    gameState.player.draw();

    // 绘制云朵装饰
    drawClouds();

    requestAnimationFrame(gameLoop);
}

// 绘制云朵装饰
function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    
    // 几朵固定位置的云
    const clouds = [
        { x: 100, y: 100 },
        { x: 500, y: 200 },
        { x: 300, y: 350 }
    ];
    
    for (let cloud of clouds) {
        const scrollY = (gameState.camera.y * 0.3) % 500;
        drawCloud(cloud.x, cloud.y - scrollY);
    }
}

function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 20, y - 5, 25, 0, Math.PI * 2);
    ctx.arc(x + 40, y, 20, 0, Math.PI * 2);
    ctx.fill();
}

// 键盘事件
document.addEventListener('keydown', (e) => {
    gameState.keys[e.key] = true;
    
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        gameState.player.jump();
    }
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.key] = false;
});

// 按钮事件
document.getElementById('restartBtn').addEventListener('click', () => {
    initGame();
});

document.getElementById('playAgainBtn').addEventListener('click', () => {
    document.getElementById('victoryModal').classList.remove('active');
    initGame();
});

// 启动游戏
initGame();
gameLoop();

