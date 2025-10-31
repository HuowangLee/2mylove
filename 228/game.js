// 游戏配置
const config = {
    canvasWidth: 800,
    canvasHeight: 500,
    playerSize: 40,
    itemSize: 35,
    playerSpeed: 3,
    interactDistance: 50
};

// 游戏状态
const gameState = {
    currentScreen: 'start', // start, game, end
    player: {
        x: 400,
        y: 250,
        direction: 'down',
        speed: config.playerSpeed
    },
    collected: {
        cows: 0,
        milk: 0,
        flowers: 0
    },
    items: {
        cows: [],
        milkStations: [],
        flowers: []
    },
    keys: {},
    interactable: null,
    easterEggTriggered: false,
    followers: [] // 跟随的牛牛
};

// DOM元素（在DOM加载后初始化）
let startScreen, gameScreen, endScreen, canvas, ctx;
let startButton, restartButton, taskHint, interactHint;
let cowCount, milkCount, flowerCount, easterEgg;

// 初始化游戏物品
function initializeItems() {
    gameState.items.cows = [
        { x: 150, y: 150, collected: false, emoji: '🐄', type: 'cow' },
        { x: 650, y: 350, collected: false, emoji: '🐄', type: 'cow' }
    ];
    
    gameState.items.milkStations = [
        { x: 200, y: 400, collected: false, emoji: '🥛', type: 'milk', progress: 0 },
        { x: 600, y: 100, collected: false, emoji: '🥛', type: 'milk', progress: 0 }
    ];
    
    gameState.items.flowers = [];
    const flowerPositions = [
        {x: 100, y: 100}, {x: 700, y: 100},
        {x: 400, y: 150}, {x: 250, y: 250},
        {x: 550, y: 250}, {x: 350, y: 350},
        {x: 150, y: 450}, {x: 650, y: 450},
        {x: 400, y: 50} // 第9朵花（彩蛋）
    ];
    
    flowerPositions.forEach((pos, index) => {
        gameState.items.flowers.push({
            x: pos.x,
            y: pos.y,
            collected: false,
            emoji: '💐',
            type: 'flower',
            isEasterEgg: index === 8
        });
    });
    
    gameState.followers = [];
}

// 重置游戏
function resetGame() {
    gameState.player.x = 400;
    gameState.player.y = 250;
    gameState.collected = { cows: 0, milk: 0, flowers: 0 };
    gameState.interactable = null;
    gameState.easterEggTriggered = false;
    initializeItems();
    updateProgress();
    updateTaskHint();
}

// 更新任务提示
function updateTaskHint() {
    const { cows, milk, flowers } = gameState.collected;
    
    if (cows < 2) {
        taskHint.textContent = '🎯 任务：寻找2只大牛牛';
    } else if (milk < 2) {
        taskHint.textContent = '🎯 任务：收集2杯牛奶';
    } else if (flowers < 8) {
        taskHint.textContent = '🎯 任务：摘取8朵心形花';
    } else {
        taskHint.textContent = '✨ 恭喜！已收集完成！';
    }
}

// 更新进度显示
function updateProgress() {
    cowCount.textContent = `${gameState.collected.cows}/2`;
    milkCount.textContent = `${gameState.collected.milk}/2`;
    flowerCount.textContent = `${gameState.collected.flowers}/8`;
}

// 切换屏幕
function switchScreen(screen) {
    startScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    
    if (screen === 'start') {
        startScreen.classList.remove('hidden');
    } else if (screen === 'game') {
        gameScreen.classList.remove('hidden');
    } else if (screen === 'end') {
        endScreen.classList.remove('hidden');
        createHeartParticles();
    }
    
    gameState.currentScreen = screen;
}

// 开始游戏
function startGame() {
    resetGame();
    switchScreen('game');
    gameLoop();
}

// 键盘事件
document.addEventListener('keydown', (e) => {
    gameState.keys[e.key] = true;
    
    // 空格键互动
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        interact();
    }
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.key] = false;
});

// 更新玩家位置
function updatePlayer() {
    const player = gameState.player;
    let moved = false;
    
    if (gameState.keys['ArrowUp']) {
        player.y = Math.max(player.speed, player.y - player.speed);
        player.direction = 'up';
        moved = true;
    }
    if (gameState.keys['ArrowDown']) {
        player.y = Math.min(config.canvasHeight - config.playerSize, player.y + player.speed);
        player.direction = 'down';
        moved = true;
    }
    if (gameState.keys['ArrowLeft']) {
        player.x = Math.max(player.speed, player.x - player.speed);
        player.direction = 'left';
        moved = true;
    }
    if (gameState.keys['ArrowRight']) {
        player.x = Math.min(config.canvasWidth - config.playerSize, player.x + player.speed);
        player.direction = 'right';
        moved = true;
    }
    
    // 更新跟随的牛牛位置
    if (moved && gameState.followers.length > 0) {
        updateFollowers();
    }
}

// 更新跟随者位置
function updateFollowers() {
    const player = gameState.player;
    const spacing = 50;
    
    gameState.followers.forEach((follower, index) => {
        const targetX = player.x - (index + 1) * spacing * (player.direction === 'right' ? -1 : player.direction === 'left' ? 1 : 0);
        const targetY = player.y - (index + 1) * spacing * (player.direction === 'down' ? -1 : player.direction === 'up' ? 1 : 0);
        
        follower.x += (targetX - follower.x) * 0.1;
        follower.y += (targetY - follower.y) * 0.1;
    });
}

// 检测可互动物品
function checkInteractables() {
    const player = gameState.player;
    let nearestItem = null;
    let minDistance = config.interactDistance;
    
    // 检查所有未收集的物品
    [...gameState.items.cows, ...gameState.items.milkStations, ...gameState.items.flowers]
        .filter(item => !item.collected)
        .forEach(item => {
            const distance = Math.hypot(player.x - item.x, player.y - item.y);
            if (distance < minDistance) {
                minDistance = distance;
                nearestItem = item;
            }
        });
    
    gameState.interactable = nearestItem;
    
    if (nearestItem) {
        interactHint.classList.remove('hidden');
    } else {
        interactHint.classList.add('hidden');
    }
}

// 互动
function interact() {
    if (!gameState.interactable) return;
    
    const item = gameState.interactable;
    
    if (item.type === 'cow') {
        // 收集牛牛
        item.collected = true;
        gameState.collected.cows++;
        gameState.followers.push({ x: item.x, y: item.y, emoji: '🐄' });
        updateProgress();
        updateTaskHint();
        showFloatingText(item.x, item.y, '哞~ 我来啦！');
        
    } else if (item.type === 'milk') {
        // 挤奶动画
        if (item.progress < 100) {
            item.progress += 20;
            if (item.progress >= 100) {
                item.collected = true;
                gameState.collected.milk++;
                updateProgress();
                updateTaskHint();
                showFloatingText(item.x, item.y, '获得新鲜牛奶！');
            }
        }
        
    } else if (item.type === 'flower') {
        // 收集花
        item.collected = true;
        gameState.collected.flowers++;
        updateProgress();
        updateTaskHint();
        showFloatingText(item.x, item.y, '摘到心形花！');
        
        // 彩蛋：第9朵花
        if (item.isEasterEgg && !gameState.easterEggTriggered) {
            gameState.easterEggTriggered = true;
            showEasterEgg();
        }
    }
    
    gameState.interactable = null;
    
    // 检查是否完成
    checkCompletion();
}

// 显示浮动文字
function showFloatingText(x, y, text) {
    const div = document.createElement('div');
    div.textContent = text;
    div.style.position = 'absolute';
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    div.style.color = '#ff6b9d';
    div.style.fontWeight = 'bold';
    div.style.fontSize = '14px';
    div.style.pointerEvents = 'none';
    div.style.animation = 'floatUp 1s forwards';
    div.style.zIndex = '1000';
    
    gameScreen.appendChild(div);
    
    setTimeout(() => {
        div.remove();
    }, 1000);
}

// 添加浮动动画
const style = document.createElement('style');
style.textContent = `
@keyframes floatUp {
    0% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-50px); }
}
`;
document.head.appendChild(style);

// 显示彩蛋
function showEasterEgg() {
    easterEgg.classList.remove('hidden');
    setTimeout(() => {
        easterEgg.classList.add('hidden');
    }, 3000);
}

// 检查完成
function checkCompletion() {
    const { cows, milk, flowers } = gameState.collected;
    if (cows >= 2 && milk >= 2 && flowers >= 8) {
        setTimeout(() => {
            switchScreen('end');
        }, 1000);
    }
}

// 创建心形粒子
function createHeartParticles() {
    const container = document.getElementById('heartsContainer');
    container.innerHTML = '';
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'heart-particle';
            heart.textContent = ['❤️', '💕', '💖', '💗'][Math.floor(Math.random() * 4)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDelay = Math.random() * 2 + 's';
            container.appendChild(heart);
        }, i * 200);
    }
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
    
    // 绘制装饰元素
    drawDecorations();
    
    // 绘制未收集的物品
    gameState.items.flowers.forEach(item => {
        if (!item.collected) {
            drawItem(item);
        }
    });
    
    gameState.items.milkStations.forEach(item => {
        if (!item.collected) {
            drawMilkStation(item);
        }
    });
    
    gameState.items.cows.forEach(item => {
        if (!item.collected) {
            drawItem(item);
        }
    });
    
    // 绘制跟随的牛牛
    gameState.followers.forEach(follower => {
        ctx.font = '35px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(follower.emoji, follower.x, follower.y);
    });
    
    // 绘制玩家
    drawPlayer();
    
    // 绘制互动提示圈
    if (gameState.interactable) {
        drawInteractCircle(gameState.interactable);
    }
}

// 绘制装饰
function drawDecorations() {
    // 绘制小草
    ctx.font = '20px Arial';
    for (let i = 0; i < 15; i++) {
        const x = (i * 60 + 30) % config.canvasWidth;
        const y = Math.floor(i * 60 / config.canvasWidth) * 80 + 40;
        ctx.fillText('🌱', x, y);
    }
    
    // 绘制栅栏
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(config.canvasWidth, 50);
    ctx.stroke();
    
    // 绘制小池塘
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.ellipse(400, 400, 60, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '20px Arial';
    ctx.fillText('💧', 400, 400);
}

// 绘制物品
function drawItem(item) {
    ctx.font = config.itemSize + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.emoji, item.x, item.y);
}

// 绘制挤奶站
function drawMilkStation(item) {
    ctx.font = config.itemSize + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.emoji, item.x, item.y);
    
    // 绘制进度条
    if (item.progress > 0) {
        const barWidth = 50;
        const barHeight = 5;
        ctx.fillStyle = '#ddd';
        ctx.fillRect(item.x - barWidth/2, item.y + 30, barWidth, barHeight);
        ctx.fillStyle = '#ff6b9d';
        ctx.fillRect(item.x - barWidth/2, item.y + 30, barWidth * item.progress / 100, barHeight);
    }
}

// 绘制玩家
function drawPlayer() {
    const player = gameState.player;
    ctx.font = config.playerSize + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐮', player.x, player.y);
    
    // 绘制移动方向指示
    ctx.fillStyle = 'rgba(255, 107, 157, 0.3)';
    ctx.beginPath();
    ctx.arc(player.x, player.y, config.playerSize/2 + 5, 0, Math.PI * 2);
    ctx.fill();
}

// 绘制互动圈
function drawInteractCircle(item) {
    ctx.strokeStyle = '#ff6b9d';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(item.x, item.y, 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
}

// 游戏主循环
function gameLoop() {
    if (gameState.currentScreen !== 'game') return;
    
    updatePlayer();
    checkInteractables();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// 初始化DOM元素和事件监听
function initializeDOM() {
    // 获取DOM元素
    startScreen = document.getElementById('startScreen');
    gameScreen = document.getElementById('gameScreen');
    endScreen = document.getElementById('endScreen');
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    startButton = document.getElementById('startButton');
    restartButton = document.getElementById('restartButton');
    taskHint = document.getElementById('taskHint');
    interactHint = document.getElementById('interactHint');
    cowCount = document.getElementById('cowCount');
    milkCount = document.getElementById('milkCount');
    flowerCount = document.getElementById('flowerCount');
    easterEgg = document.getElementById('easterEgg');
    
    // 设置画布大小
    canvas.width = config.canvasWidth;
    canvas.height = config.canvasHeight;
    
    // 绑定事件监听
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', () => {
        switchScreen('game');
        startGame();
    });
    
    // 初始化游戏
    initializeItems();
    switchScreen('start');
}

// 等待DOM加载完成
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDOM);
} else {
    initializeDOM();
}

