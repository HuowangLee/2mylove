class SokobanGame {
    constructor() {
        this.currentLevel = 0;
        this.moves = 0;
        this.gameBoard = document.getElementById('gameBoard');
        this.levelDisplay = document.getElementById('level');
        this.movesDisplay = document.getElementById('moves');
        this.celebrationModal = document.getElementById('celebrationModal');
        
        // 定义游戏关卡 - 从简单到困难
        this.levels = [
            // 关卡1 - 简单（增加障碍物）
            {
                width: 10,
                height: 8,
                map: [
                    '##########',
                    '#........#',
                    '#.@......#',
                    '#.$......#',
                    '#...#....#',
                    '#...#....#',
                    '#........#',
                    '##########'
                ],
                targets: [{x: 8, y: 2}]
            },
            // 关卡2 - 中等（复杂迷宫）
            {
                width: 14,
                height: 10,
                map: [
                    '##############',
                    '#............#',
                    '#.$..........#',
                    '#.@..........#',
                    '#.$..........#',
                    '#....##......#',
                    '#....##......#',
                    '#..........##',
                    '#..........##',
                    '##############'
                ],
                targets: [{x: 11, y: 2}, {x: 11, y: 4}]
            },
            // 关卡3 - 困难（终极挑战）
            {
                width: 16,
                height: 12,
                map: [
                    '################',
                    '#..............#',
                    '#.$............#',
                    '#.@............#',
                    '#.$............#',
                    '#....##........#',
                    '#....##........#',
                    '#..............#',
                    '#.$............#',
                    '#....##........#',
                    '#....##........#',
                    '################'
                ],
                targets: [{x: 13, y: 2}, {x: 13, y: 4}, {x: 13, y: 8}]
            }
        ];
        
        this.init();
    }
    
    init() {
        this.loadLevel(this.currentLevel);
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // 按钮控制
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetLevel();
        });
        
        document.getElementById('prevLevelBtn').addEventListener('click', () => {
            this.previousLevel();
        });
        
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            this.nextLevel();
        });
        
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.closeCelebrationModal();
        });
    }
    
    loadLevel(levelIndex) {
        if (levelIndex >= this.levels.length) {
            this.showCelebration();
            return;
        }
        
        const level = this.levels[levelIndex];
        this.currentLevel = levelIndex;
        this.moves = 0;
        this.updateDisplay();
        
        // 清空游戏板
        this.gameBoard.innerHTML = '';
        this.gameBoard.style.gridTemplateColumns = `repeat(${level.width}, 1fr)`;
        this.gameBoard.style.gridTemplateRows = `repeat(${level.height}, 1fr)`;
        
        // 创建游戏元素
        for (let y = 0; y < level.height; y++) {
            for (let x = 0; x < level.width; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                const char = level.map[y][x];
                switch (char) {
                    case '#':
                        cell.classList.add('wall');
                        break;
                    case '@':
                        cell.classList.add('player');
                        this.playerPos = {x, y};
                        break;
                    case '$':
                        cell.classList.add('box');
                        break;
                    case '.':
                        cell.classList.add('floor');
                        break;
                }
                
                this.gameBoard.appendChild(cell);
            }
        }
        
        // 添加目标位置
        level.targets.forEach(target => {
            const cell = this.getCell(target.x, target.y);
            if (cell) {
                cell.classList.add('target');
            }
        });
    }
    
    getCell(x, y) {
        return document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    }
    
    handleKeyPress(e) {
        let dx = 0, dy = 0;
        
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                dy = -1;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                dy = 1;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                dx = -1;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                dx = 1;
                break;
            default:
                return;
        }
        
        e.preventDefault();
        this.movePlayer(dx, dy);
    }
    
    movePlayer(dx, dy) {
        const newX = this.playerPos.x + dx;
        const newY = this.playerPos.y + dy;
        
        const currentCell = this.getCell(this.playerPos.x, this.playerPos.y);
        const nextCell = this.getCell(newX, newY);
        
        if (!nextCell) return;
        
        // 检查下一个位置
        if (nextCell.classList.contains('wall')) {
            return; // 撞墙
        }
        
        if (nextCell.classList.contains('box')) {
            // 推箱子
            const boxNewX = newX + dx;
            const boxNewY = newY + dy;
            const boxNextCell = this.getCell(boxNewX, boxNewY);
            
            if (!boxNextCell || 
                boxNextCell.classList.contains('wall') || 
                boxNextCell.classList.contains('box')) {
                return; // 箱子无法移动
            }
            
            // 移动箱子
            nextCell.classList.remove('box');
            boxNextCell.classList.add('box');
        }
        
        // 移动玩家
        currentCell.classList.remove('player');
        nextCell.classList.add('player');
        this.playerPos = {x: newX, y: newY};
        
        this.moves++;
        this.updateDisplay();
        
        // 检查是否完成关卡
        if (this.checkWin()) {
            setTimeout(() => {
                this.nextLevel();
            }, 500);
        }
    }
    
    checkWin() {
        const targets = this.levels[this.currentLevel].targets;
        return targets.every(target => {
            const cell = this.getCell(target.x, target.y);
            return cell && cell.classList.contains('box');
        });
    }
    
    updateDisplay() {
        this.levelDisplay.textContent = this.currentLevel + 1;
        this.movesDisplay.textContent = this.moves;
    }
    
    resetLevel() {
        this.loadLevel(this.currentLevel);
    }
    
    previousLevel() {
        if (this.currentLevel > 0) {
            this.loadLevel(this.currentLevel - 1);
        }
    }
    
    nextLevel() {
        if (this.currentLevel < this.levels.length - 1) {
            this.loadLevel(this.currentLevel + 1);
        } else {
            this.showCelebration();
        }
    }
    
    showCelebration() {
        this.celebrationModal.style.display = 'flex';
        // 添加庆祝动画
        setTimeout(() => {
            document.querySelectorAll('.confetti').forEach((confetti, index) => {
                confetti.style.animation = `confetti-fall 2s ease-in-out ${index * 0.1}s infinite`;
            });
        }, 100);
    }
    
    closeCelebrationModal() {
        this.celebrationModal.style.display = 'none';
        // 重置到第一关
        this.loadLevel(0);
    }
}

// 启动游戏
document.addEventListener('DOMContentLoaded', () => {
    new SokobanGame();
});
