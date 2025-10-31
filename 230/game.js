// 游戏配置
const TILE_SIZE = 20;
const PACMAN_SPEED = 1.2;  // 吃豆人速度 (建议值: 0.8-1.5)
const GHOST_SPEED = 1;      // 幽灵速度 (建议值: 0.6-1.2)
const POWER_PELLET_DURATION = 8000;

// 地图 (0=空, 1=墙, 2=豆子, 3=能量豆, 4=空地)
const MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,2,1,1,1,2,1,2,1],
    [1,3,1,1,1,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,2,1,1,1,2,1,3,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,1,2,2,2,2,2,2,1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,1,1,1,1,1,4,1,1,4,1,1,1,1,1,1,2,1,1,1,1,1,1,1],
    [1,1,1,1,1,2,1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1,2,1,1,1,1,1,1,1],
    [1,1,1,1,1,2,1,4,1,1,1,4,1,1,1,1,4,1,1,1,4,1,2,1,1,1,1,1,1,1],
    [4,4,4,4,4,2,4,4,1,4,4,4,1,1,1,1,4,4,4,1,4,4,2,4,4,4,4,4,4,4],
    [1,1,1,1,1,2,1,4,1,1,1,1,1,4,4,1,1,1,1,1,4,1,2,1,1,1,1,1,1,1],
    [1,1,1,1,1,2,1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1,2,1,1,1,1,1,1,1],
    [1,1,1,1,1,2,1,4,1,1,1,1,1,1,1,1,1,1,1,1,4,1,2,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,2,1,1,1,2,1,2,1],
    [1,2,2,2,1,2,2,2,2,2,2,2,2,2,4,2,2,2,2,2,2,2,2,1,2,2,2,2,2,1],
    [1,1,1,2,1,2,1,2,1,1,1,1,1,1,1,1,1,1,1,1,2,1,2,1,2,1,1,1,2,1],
    [1,1,1,2,1,2,1,2,2,2,2,2,2,1,1,2,2,2,2,2,2,1,2,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// 游戏状态
let canvas, ctx;
let score = 0;
let lives = 3;
let totalDots = 0;
let dotsEaten = 0;
let isPowerMode = false;
let powerModeTimer = null;
let gameRunning = true;

// 吃豆人
let pacman = {
    x: 1.5,
    y: 1.5,
    targetX: 1.5,
    targetY: 1.5,
    direction: { x: 0, y: 0 },
    nextDirection: { x: 0, y: 0 },
    mouthOpen: 0,
    mouthDirection: 1
};

// 幽灵
let ghosts = [
    { x: 13, y: 9, targetX: 13, targetY: 9, color: '#ff0000', direction: { x: 1, y: 0 }, name: 'Blinky' },
    { x: 14, y: 9, targetX: 14, targetY: 9, color: '#00ffff', direction: { x: -1, y: 0 }, name: 'Inky' },
    { x: 15, y: 9, targetX: 15, targetY: 9, color: '#ffb8ff', direction: { x: 0, y: -1 }, name: 'Pinky' },
    { x: 16, y: 9, targetX: 16, targetY: 9, color: '#ffb852', direction: { x: 0, y: 1 }, name: 'Clyde' }
];

// 触摸控制变量
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
const minSwipeDistance = 30; // 最小滑动距离

// 初始化游戏
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // 根据屏幕大小调整画布尺寸
    adjustCanvasSize();
    
    // 计算总豆子数
    totalDots = 0;
    for (let row of MAP) {
        for (let cell of row) {
            if (cell === 2 || cell === 3) totalDots++;
        }
    }
    
    // 键盘控制
    document.addEventListener('keydown', handleKeyPress);
    
    // 触摸控制（滑动）
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // 虚拟方向键控制
    setupVirtualControls();
    
    // 重启按钮
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('restartBtn2').addEventListener('click', restartGame);
    
    // 窗口大小改变时重新调整画布
    window.addEventListener('resize', adjustCanvasSize);
    
    gameLoop();
}

// 调整画布大小以适应屏幕
function adjustCanvasSize() {
    const baseWidth = MAP[0].length * TILE_SIZE;
    const baseHeight = MAP.length * TILE_SIZE;
    
    // 在移动设备上缩小画布以适应屏幕
    if (window.innerWidth <= 768) {
        const maxWidth = window.innerWidth - 40;
        const scale = maxWidth / baseWidth;
        canvas.width = baseWidth;
        canvas.height = baseHeight;
        canvas.style.width = (baseWidth * scale) + 'px';
        canvas.style.height = (baseHeight * scale) + 'px';
    } else {
        canvas.width = baseWidth;
        canvas.height = baseHeight;
        canvas.style.width = baseWidth + 'px';
        canvas.style.height = baseHeight + 'px';
    }
}

// 设置虚拟控制按键
function setupVirtualControls() {
    const btnUp = document.getElementById('btnUp');
    const btnDown = document.getElementById('btnDown');
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    
    // 使用 touchstart 代替 click 以获得更快的响应
    btnUp.addEventListener('touchstart', (e) => {
        e.preventDefault();
        setDirection(0, -1);
    });
    
    btnDown.addEventListener('touchstart', (e) => {
        e.preventDefault();
        setDirection(0, 1);
    });
    
    btnLeft.addEventListener('touchstart', (e) => {
        e.preventDefault();
        setDirection(-1, 0);
    });
    
    btnRight.addEventListener('touchstart', (e) => {
        e.preventDefault();
        setDirection(1, 0);
    });
    
    // 为PC用户也添加点击事件
    btnUp.addEventListener('click', () => setDirection(0, -1));
    btnDown.addEventListener('click', () => setDirection(0, 1));
    btnLeft.addEventListener('click', () => setDirection(-1, 0));
    btnRight.addEventListener('click', () => setDirection(1, 0));
}

// 设置移动方向
function setDirection(x, y) {
    if (!gameRunning) return;
    pacman.nextDirection = { x, y };
}

// 处理触摸开始
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

// 处理触摸移动
function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    touchEndX = touch.clientX;
    touchEndY = touch.clientY;
}

// 处理触摸结束
function handleTouchEnd(e) {
    e.preventDefault();
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // 判断滑动方向
    if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑动
            if (deltaX > 0) {
                setDirection(1, 0); // 右
            } else {
                setDirection(-1, 0); // 左
            }
        } else {
            // 垂直滑动
            if (deltaY > 0) {
                setDirection(0, 1); // 下
            } else {
                setDirection(0, -1); // 上
            }
        }
    }
    
    // 重置触摸位置
    touchStartX = 0;
    touchStartY = 0;
    touchEndX = 0;
    touchEndY = 0;
}

// 键盘控制
function handleKeyPress(e) {
    if (!gameRunning) return;
    
    switch(e.key.toLowerCase()) {
        case 'w':
            pacman.nextDirection = { x: 0, y: -1 };
            break;
        case 's':
            pacman.nextDirection = { x: 0, y: 1 };
            break;
        case 'a':
            pacman.nextDirection = { x: -1, y: 0 };
            break;
        case 'd':
            pacman.nextDirection = { x: 1, y: 0 };
            break;
    }
}

// 检查是否可以移动
function canMove(x, y) {
    const mapX = Math.floor(x);
    const mapY = Math.floor(y);
    
    if (mapY < 0 || mapY >= MAP.length || mapX < 0 || mapX >= MAP[0].length) {
        return false;
    }
    
    return MAP[mapY][mapX] !== 1;
}

// 更新吃豆人
function updatePacman() {
    // 尝试改变方向
    const nextX = pacman.targetX + pacman.nextDirection.x * 0.1;
    const nextY = pacman.targetY + pacman.nextDirection.y * 0.1;
    
    if (canMove(nextX, nextY)) {
        pacman.direction = { ...pacman.nextDirection };
    }
    
    // 移动
    const newX = pacman.targetX + pacman.direction.x * PACMAN_SPEED * 0.1;
    const newY = pacman.targetY + pacman.direction.y * PACMAN_SPEED * 0.1;
    
    if (canMove(newX, newY)) {
        pacman.targetX = newX;
        pacman.targetY = newY;
    }
    
    pacman.x = pacman.targetX;
    pacman.y = pacman.targetY;
    
    // 嘴巴动画
    pacman.mouthOpen += 0.15 * pacman.mouthDirection;
    if (pacman.mouthOpen > 0.7 || pacman.mouthOpen < 0) {
        pacman.mouthDirection *= -1;
    }
    
    // 吃豆子
    const mapX = Math.floor(pacman.x);
    const mapY = Math.floor(pacman.y);
    
    if (MAP[mapY][mapX] === 2) {
        MAP[mapY][mapX] = 4;
        score += 10;
        dotsEaten++;
        updateScore();
        
        // 检查是否通关
        if (dotsEaten >= totalDots) {
            victory();
        }
    } else if (MAP[mapY][mapX] === 3) {
        MAP[mapY][mapX] = 4;
        score += 50;
        dotsEaten++;
        updateScore();
        activatePowerMode();
        
        // 检查是否通关
        if (dotsEaten >= totalDots) {
            victory();
        }
    }
}

// 激活能量模式
function activatePowerMode() {
    isPowerMode = true;
    
    if (powerModeTimer) {
        clearTimeout(powerModeTimer);
    }
    
    powerModeTimer = setTimeout(() => {
        isPowerMode = false;
    }, POWER_PELLET_DURATION);
}

// 更新幽灵
function updateGhosts() {
    ghosts.forEach(ghost => {
        // 简单的AI：朝向吃豆人移动（在能量模式下远离）
        const dx = pacman.x - ghost.targetX;
        const dy = pacman.y - ghost.targetY;
        
        // 随机改变方向
        if (Math.random() < 0.02) {
            const directions = [
                { x: 0, y: -1 },
                { x: 0, y: 1 },
                { x: -1, y: 0 },
                { x: 1, y: 0 }
            ];
            ghost.direction = directions[Math.floor(Math.random() * directions.length)];
        } else if (Math.random() < 0.05) {
            // 有时候朝向吃豆人
            if (!isPowerMode) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    ghost.direction = { x: dx > 0 ? 1 : -1, y: 0 };
                } else {
                    ghost.direction = { x: 0, y: dy > 0 ? 1 : -1 };
                }
            } else {
                // 能量模式下远离吃豆人
                if (Math.abs(dx) > Math.abs(dy)) {
                    ghost.direction = { x: dx > 0 ? -1 : 1, y: 0 };
                } else {
                    ghost.direction = { x: 0, y: dy > 0 ? -1 : 1 };
                }
            }
        }
        
        // 移动
        const newX = ghost.targetX + ghost.direction.x * GHOST_SPEED * 0.1;
        const newY = ghost.targetY + ghost.direction.y * GHOST_SPEED * 0.1;
        
        if (canMove(newX, newY)) {
            ghost.targetX = newX;
            ghost.targetY = newY;
        } else {
            // 碰到墙，随机换方向
            const directions = [
                { x: 0, y: -1 },
                { x: 0, y: 1 },
                { x: -1, y: 0 },
                { x: 1, y: 0 }
            ];
            ghost.direction = directions[Math.floor(Math.random() * directions.length)];
        }
        
        ghost.x = ghost.targetX;
        ghost.y = ghost.targetY;
    });
}

// 碰撞检测
function checkCollisions() {
    ghosts.forEach((ghost, index) => {
        const distance = Math.sqrt(
            Math.pow(pacman.x - ghost.x, 2) + 
            Math.pow(pacman.y - ghost.y, 2)
        );
        
        if (distance < 0.5) {
            if (isPowerMode) {
                // 吃掉幽灵
                score += 200;
                updateScore();
                resetGhost(ghost, index);
            } else {
                // 失去生命
                lives--;
                updateLives();
                
                if (lives <= 0) {
                    gameOver();
                } else {
                    resetPositions();
                }
            }
        }
    });
}

// 重置幽灵位置
function resetGhost(ghost, index) {
    const startPositions = [
        { x: 13, y: 9 },
        { x: 14, y: 9 },
        { x: 15, y: 9 },
        { x: 16, y: 9 }
    ];
    ghost.x = startPositions[index].x;
    ghost.y = startPositions[index].y;
    ghost.targetX = startPositions[index].x;
    ghost.targetY = startPositions[index].y;
}

// 重置位置（失去生命后）
function resetPositions() {
    pacman.x = 1.5;
    pacman.y = 1.5;
    pacman.targetX = 1.5;
    pacman.targetY = 1.5;
    pacman.direction = { x: 0, y: 0 };
    pacman.nextDirection = { x: 0, y: 0 };
    
    ghosts.forEach((ghost, index) => resetGhost(ghost, index));
    
    isPowerMode = false;
    if (powerModeTimer) {
        clearTimeout(powerModeTimer);
    }
}

// 绘制地图
function drawMap() {
    for (let y = 0; y < MAP.length; y++) {
        for (let x = 0; x < MAP[y].length; x++) {
            const cell = MAP[y][x];
            
            if (cell === 1) {
                // 墙壁
                ctx.fillStyle = '#1a0066';
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = '#3300cc';
                ctx.lineWidth = 2;
                ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (cell === 2) {
                // 豆子
                ctx.fillStyle = '#ffcc00';
                ctx.beginPath();
                ctx.arc(
                    x * TILE_SIZE + TILE_SIZE / 2,
                    y * TILE_SIZE + TILE_SIZE / 2,
                    2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            } else if (cell === 3) {
                // 能量豆
                ctx.fillStyle = '#ff6600';
                ctx.beginPath();
                ctx.arc(
                    x * TILE_SIZE + TILE_SIZE / 2,
                    y * TILE_SIZE + TILE_SIZE / 2,
                    5,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                ctx.fillStyle = '#ffcc00';
                ctx.beginPath();
                ctx.arc(
                    x * TILE_SIZE + TILE_SIZE / 2,
                    y * TILE_SIZE + TILE_SIZE / 2,
                    3,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
    }
}

// 绘制吃豆人
function drawPacman() {
    const x = pacman.x * TILE_SIZE;
    const y = pacman.y * TILE_SIZE;
    const radius = TILE_SIZE / 2 - 2;
    
    // 计算嘴巴方向
    let rotation = 0;
    if (pacman.direction.x === 1) rotation = 0;
    else if (pacman.direction.x === -1) rotation = Math.PI;
    else if (pacman.direction.y === -1) rotation = -Math.PI / 2;
    else if (pacman.direction.y === 1) rotation = Math.PI / 2;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    // 身体
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(0, 0, radius, pacman.mouthOpen, Math.PI * 2 - pacman.mouthOpen);
    ctx.lineTo(0, 0);
    ctx.fill();
    
    // 眼睛
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-3, -5, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// 绘制幽灵
function drawGhosts() {
    ghosts.forEach(ghost => {
        const x = ghost.x * TILE_SIZE;
        const y = ghost.y * TILE_SIZE;
        const size = TILE_SIZE / 2 - 2;
        
        if (isPowerMode) {
            // 能量模式下显示蓝色可吃状态
            ctx.fillStyle = '#0000ff';
        } else {
            ctx.fillStyle = ghost.color;
        }
        
        // 身体
        ctx.beginPath();
        ctx.arc(x, y - size / 2, size, Math.PI, 0);
        ctx.lineTo(x + size, y + size / 2);
        ctx.lineTo(x + size * 0.66, y + size / 4);
        ctx.lineTo(x + size * 0.33, y + size / 2);
        ctx.lineTo(x, y + size / 4);
        ctx.lineTo(x - size, y + size / 2);
        ctx.closePath();
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x - 3, y - 3, 3, 0, Math.PI * 2);
        ctx.arc(x + 3, y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        if (!isPowerMode) {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(x - 2, y - 3, 2, 0, Math.PI * 2);
            ctx.arc(x + 4, y - 3, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// 游戏循环
function gameLoop() {
    if (!gameRunning) return;
    
    // 清空画布
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制
    drawMap();
    drawPacman();
    drawGhosts();
    
    // 更新
    updatePacman();
    updateGhosts();
    checkCollisions();
    
    requestAnimationFrame(gameLoop);
}

// 更新分数
function updateScore() {
    document.getElementById('score').textContent = score;
}

// 更新生命
function updateLives() {
    const hearts = '❤️'.repeat(lives);
    document.getElementById('lives').textContent = hearts || '💀';
}

// 通关
function victory() {
    gameRunning = false;
    document.getElementById('victoryModal').style.display = 'block';
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverModal').style.display = 'block';
}

// 重启游戏
function restartGame() {
    location.reload();
}

// 启动游戏
window.addEventListener('load', init);

