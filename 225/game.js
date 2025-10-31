class Game225 {
    constructor() {
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('best225Score')) || 0;
        this.moves = 0;
        this.history = [];
        this.maxHistory = 3;
        this.hasWon = false;
        
        this.initGame();
        this.setupEventListeners();
    }

    initGame() {
        // 初始化空网格
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.score = 0;
        this.moves = 0;
        this.hasWon = false;
        this.history = [];
        
        // 添加两个初始方块
        this.addRandomTile();
        this.addRandomTile();
        
        this.updateDisplay();
        this.hideGameOver();
    }

    setupEventListeners() {
        // 方向键监听
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                this.handleKeyPress(e.key);
            }
        });

        // 按钮监听
        document.getElementById('newGame').addEventListener('click', () => {
            this.initGame();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.initGame();
        });

        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undo();
        });

        // 触摸支持（移动设备）
        this.setupTouchControls();
    }

    setupTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        const gameBoard = document.getElementById('gameBoard');

        gameBoard.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        gameBoard.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 横向滑动
                if (deltaX > 30) {
                    this.handleKeyPress('ArrowRight');
                } else if (deltaX < -30) {
                    this.handleKeyPress('ArrowLeft');
                }
            } else {
                // 纵向滑动
                if (deltaY > 30) {
                    this.handleKeyPress('ArrowDown');
                } else if (deltaY < -30) {
                    this.handleKeyPress('ArrowUp');
                }
            }
        });
    }

    handleKeyPress(key) {
        if (this.isGameOver()) return;

        // 保存当前状态到历史
        this.saveState();

        let moved = false;
        const oldGrid = JSON.parse(JSON.stringify(this.grid));

        switch(key) {
            case 'ArrowUp':
                moved = this.moveUp();
                break;
            case 'ArrowDown':
                moved = this.moveDown();
                break;
            case 'ArrowLeft':
                moved = this.moveLeft();
                break;
            case 'ArrowRight':
                moved = this.moveRight();
                break;
        }

        if (moved) {
            this.moves++;
            this.addRandomTile();
            this.updateDisplay();
            
            // 检查是否达到225
            if (this.hasReached225() && !this.hasWon) {
                this.hasWon = true;
                setTimeout(() => {
                    this.showGameOver(true);
                }, 500);
            } else if (this.isGameOver()) {
                setTimeout(() => {
                    this.showGameOver(false);
                }, 500);
            }
        } else {
            // 没有移动，撤销保存的状态
            this.history.pop();
        }
    }

    saveState() {
        const state = {
            grid: JSON.parse(JSON.stringify(this.grid)),
            score: this.score,
            moves: this.moves
        };
        
        this.history.push(state);
        
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
        
        this.updateUndoButton();
    }

    undo() {
        if (this.history.length === 0) return;
        
        const lastState = this.history.pop();
        this.grid = lastState.grid;
        this.score = lastState.score;
        this.moves = lastState.moves;
        
        this.updateDisplay();
        this.updateUndoButton();
        this.hideGameOver();
    }

    updateUndoButton() {
        const undoBtn = document.getElementById('undoBtn');
        undoBtn.disabled = this.history.length === 0;
    }

    moveLeft() {
        return this.move((row) => this.slideAndMerge(row));
    }

    moveRight() {
        return this.move((row) => this.slideAndMerge(row.reverse()).reverse());
    }

    moveUp() {
        this.transposeGrid();
        const moved = this.moveLeft();
        this.transposeGrid();
        return moved;
    }

    moveDown() {
        this.transposeGrid();
        const moved = this.moveRight();
        this.transposeGrid();
        return moved;
    }

    move(slideFunc) {
        let moved = false;
        const newGrid = [];

        for (let i = 0; i < this.size; i++) {
            const newRow = slideFunc([...this.grid[i]]);
            newGrid.push(newRow);
            
            if (JSON.stringify(newRow) !== JSON.stringify(this.grid[i])) {
                moved = true;
            }
        }

        this.grid = newGrid;
        return moved;
    }

    slideAndMerge(row) {
        // 移除0
        let newRow = row.filter(val => val !== 0);
        
        // 合并规则：相同数字可以合并，或者一个是另一个的倍数关系（15的倍数系统）
        for (let i = 0; i < newRow.length - 1; i++) {
            const current = newRow[i];
            const next = newRow[i + 1];
            let shouldMerge = false;
            
            // 规则1：相同数字可以合并
            if (current === next) {
                shouldMerge = true;
            }
            // 规则2：特殊组合可以合并（为了能达到225）
            // 允许 15的倍数之间按照一定规则合并
            else if (current % 15 === 0 && next % 15 === 0) {
                // 如果两个数相差不超过一倍，可以合并
                const ratio = Math.max(current, next) / Math.min(current, next);
                if (ratio <= 2) {
                    shouldMerge = true;
                }
            }
            
            if (shouldMerge) {
                newRow[i] = current + next;
                newRow[i + 1] = 0;
                this.score += newRow[i];
                
                // 更新最高分
                if (this.score > this.bestScore) {
                    this.bestScore = this.score;
                    localStorage.setItem('best225Score', this.bestScore);
                }
            }
        }
        
        // 再次移除0
        newRow = newRow.filter(val => val !== 0);
        
        // 填充到固定长度
        while (newRow.length < this.size) {
            newRow.push(0);
        }
        
        return newRow;
    }

    transposeGrid() {
        const newGrid = [];
        for (let i = 0; i < this.size; i++) {
            newGrid[i] = [];
            for (let j = 0; j < this.size; j++) {
                newGrid[i][j] = this.grid[j][i];
            }
        }
        this.grid = newGrid;
    }

    addRandomTile() {
        const emptyCells = [];
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            // 90%概率生成15，10%概率生成30
            this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 15 : 30;
        }
    }

    hasReached225() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 225) {
                    return true;
                }
            }
        }
        return false;
    }

    isGameOver() {
        // 如果还有空格子，游戏继续
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // 检查是否还能合并
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                
                // 检查右边
                if (j < this.size - 1 && current === this.grid[i][j + 1]) {
                    return false;
                }
                
                // 检查下面
                if (i < this.size - 1 && current === this.grid[i + 1][j]) {
                    return false;
                }
            }
        }
        
        return true;
    }

    updateDisplay() {
        // 更新分数显示
        document.getElementById('score').textContent = this.score;
        document.getElementById('best').textContent = this.bestScore;
        document.getElementById('moves').textContent = this.moves;
        
        // 更新游戏板
        this.renderGrid();
    }

    renderGrid() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        // 创建背景方块
        for (let i = 0; i < this.size * this.size; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            gameBoard.appendChild(tile);
        }
        
        // 创建数字方块
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.grid[i][j];
                if (value !== 0) {
                    const tileCell = document.createElement('div');
                    tileCell.className = `tile-cell tile-${value}`;
                    tileCell.textContent = value;
                    
                    // 计算位置
                    const cellSize = (gameBoard.offsetWidth - 15 * (this.size + 1)) / this.size;
                    const left = 15 + j * (cellSize + 15);
                    const top = 15 + i * (cellSize + 15);
                    
                    tileCell.style.width = cellSize + 'px';
                    tileCell.style.height = cellSize + 'px';
                    tileCell.style.left = left + 'px';
                    tileCell.style.top = top + 'px';
                    
                    gameBoard.appendChild(tileCell);
                }
            }
        }
    }

    showGameOver(won) {
        const gameOverDiv = document.getElementById('gameOver');
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');
        
        if (won) {
            title.textContent = '🎉 恭喜你！';
            message.textContent = `你成功达到了 225！\n得分：${this.score} | 移动：${this.moves}步`;
        } else {
            title.textContent = '😢 游戏结束';
            message.textContent = `没有可移动的空间了\n最终得分：${this.score} | 移动：${this.moves}步`;
        }
        
        gameOverDiv.classList.remove('hidden');
    }

    hideGameOver() {
        document.getElementById('gameOver').classList.add('hidden');
    }
}

// 启动游戏
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new Game225();
});

