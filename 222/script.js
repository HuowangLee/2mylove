// 游戏状态
let gameState = {
    hintsRevealed: [false, false, false],
    currentHintIndex: 0,
    gameCompleted: false,
    puzzleSlots: ['', '', ''],
    draggedElement: null
};

// 线索内容
const hints = [
    "🔢 第一个数字：2的平方根是多少？",
    "🔢 第二个数字：二进制10的十进制值", 
    "🔢 第三个数字：1 + 1 = ?"
];

// 初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
});

function initializeGame() {
    // 绑定提示点击事件
    const hintElements = document.querySelectorAll('.hint-item');
    hintElements.forEach((hint, index) => {
        hint.addEventListener('click', () => revealHint(index));
    });

    // 绑定拖拽事件
    setupDragAndDrop();

    // 绑定提交按钮事件
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.addEventListener('click', checkAnswer);

    // 绑定输入框回车事件
    const answerInput = document.getElementById('answerInput');
    answerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });

    // 绑定重新开始按钮
    const playAgainBtn = document.getElementById('playAgainBtn');
    playAgainBtn.addEventListener('click', resetGame);

    // 添加输入限制
    answerInput.addEventListener('input', function(e) {
        // 只允许输入数字，最多3位
        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
    });
}

function revealHint(index) {
    if (gameState.hintsRevealed[index]) return;

    const hintElement = document.getElementById(`hint${index + 1}`);
    const hintText = hintElement.querySelector('.hint-text');
    
    // 显示提示内容
    hintText.textContent = hints[index];
    hintElement.classList.add('revealed');
    gameState.hintsRevealed[index] = true;
    gameState.currentHintIndex++;

    // 添加可爱的小动画
    hintElement.style.animation = 'reveal 0.5s ease-out';
    
    // 更新小兔子的对话
    updateRabbitDialogue(index);

    // 检查是否所有提示都显示了
    if (gameState.currentHintIndex === 3) {
        showFinalHint();
    }
}

function setupDragAndDrop() {
    const numberItems = document.querySelectorAll('.number-item');
    const slots = document.querySelectorAll('.slot');

    // 为数字项添加拖拽事件
    numberItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });

    // 为槽位添加拖拽事件
    slots.forEach((slot, index) => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', (e) => handleDrop(e, index));
        slot.addEventListener('dragenter', handleDragEnter);
        slot.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    gameState.draggedElement = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    gameState.draggedElement = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    e.target.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
}

function handleDrop(e, slotIndex) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    
    if (gameState.draggedElement) {
        const value = gameState.draggedElement.dataset.value;
        const slot = e.target;
        
        // 更新游戏状态
        gameState.puzzleSlots[slotIndex] = value;
        
        // 更新UI
        slot.textContent = value;
        slot.classList.add('filled');
        slot.classList.remove('drag-over');
        
        // 不隐藏数字，允许重复使用
        // gameState.draggedElement.style.display = 'none';
        
        // 检查是否完成拼图
        checkPuzzleComplete();
        
        // 更新小兔子对话
        updateRabbitDialogue(slotIndex);
    }
}

function checkPuzzleComplete() {
    const filledSlots = gameState.puzzleSlots.filter(slot => slot !== '');
    if (filledSlots.length === 3) {
        const puzzleAnswer = gameState.puzzleSlots.join('');
        if (puzzleAnswer === '222') {
            showCelebration();
            gameState.gameCompleted = true;
        } else {
            showMessage('拼图不对哦，再试试看！', 'error');
            // 重置拼图
            setTimeout(() => {
                resetPuzzle();
            }, 2000);
        }
    }
}

function resetPuzzle() {
    gameState.puzzleSlots = ['', '', ''];
    const slots = document.querySelectorAll('.slot');
    const numberItems = document.querySelectorAll('.number-item');
    
    slots.forEach(slot => {
        slot.textContent = '?';
        slot.classList.remove('filled');
    });
    
    // 确保所有数字都可见
    numberItems.forEach(item => {
        item.style.display = 'flex';
        item.style.opacity = '1';
    });
}

function updateRabbitDialogue(clueIndex) {
    const speechBubble = document.querySelector('.speech-bubble');
    const dialogues = [
        "太棒了！你找到了第一个线索！",
        "很好！继续加油！",
        "最后一个线索了，你快要成功了！"
    ];
    
    if (clueIndex < dialogues.length) {
        speechBubble.innerHTML = `<p>${dialogues[clueIndex]}</p>`;
    }
}

function showFinalHint() {
    const hint = document.getElementById('hint');
    hint.innerHTML = '🎯 所有线索都收集完了！现在你知道答案了吗？';
    hint.style.background = 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)';
    hint.style.color = '#ff6b9d';
    hint.style.fontWeight = 'bold';
    
    // 更新小兔子对话
    const speechBubble = document.querySelector('.speech-bubble');
    speechBubble.innerHTML = '<p>🎉 太棒了！现在你知道答案了吗？</p><p>输入你的答案吧～</p>';
}

function checkAnswer() {
    const answerInput = document.getElementById('answerInput');
    const userAnswer = answerInput.value.trim();
    
    if (!userAnswer) {
        showMessage('请输入一个答案！', 'warning');
        return;
    }

    if (userAnswer === '222') {
        // 正确答案！
        showCelebration();
        gameState.gameCompleted = true;
    } else {
        // 错误答案
        showMessage('答案不对哦，再仔细想想！', 'error');
        answerInput.value = '';
        answerInput.focus();
        
        // 添加震动效果
        answerInput.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            answerInput.style.animation = '';
        }, 500);
    }
}

function showMessage(message, type) {
    const hint = document.getElementById('hint');
    const colors = {
        warning: '#ffa726',
        error: '#f44336',
        success: '#4caf50'
    };
    
    hint.textContent = message;
    hint.style.background = colors[type] || '#ff6b9d';
    hint.style.color = 'white';
    hint.style.fontWeight = 'bold';
    
    // 3秒后恢复原样
    setTimeout(() => {
        if (!gameState.gameCompleted) {
            hint.innerHTML = '💡 提示：仔细观察线索，它们会告诉你答案！';
            hint.style.background = 'rgba(255, 255, 255, 0.7)';
            hint.style.color = '#666';
            hint.style.fontWeight = 'normal';
        }
    }, 3000);
}

function showCelebration() {
    const celebration = document.getElementById('celebration');
    celebration.style.display = 'flex';
    
    // 创建彩带效果
    createConfetti();
    
    // 播放成功音效（如果浏览器支持）
    playSuccessSound();
}

function createConfetti() {
    const confettiContainer = document.querySelector('.confetti');
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.background = ['#ff6b9d', '#ff9a9e', '#fecfef', '#a8edea'][Math.floor(Math.random() * 4)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animation = `confetti-fall ${2 + Math.random() * 3}s linear infinite`;
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confettiContainer.appendChild(confetti);
    }
}

function playSuccessSound() {
    // 创建一个简单的音效（使用Web Audio API）
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        // 如果音频不支持，静默失败
        console.log('Audio not supported');
    }
}

function resetGame() {
    // 重置游戏状态
    gameState = {
        hintsRevealed: [false, false, false],
        currentHintIndex: 0,
        gameCompleted: false,
        puzzleSlots: ['', '', ''],
        draggedElement: null
    };
    
    // 重置UI
    const hintElements = document.querySelectorAll('.hint-item');
    hintElements.forEach((hint, index) => {
        const hintText = hint.querySelector('.hint-text');
        hintText.textContent = `点击查看第${index + 1}个提示`;
        hint.classList.remove('revealed');
        hint.style.animation = '';
    });
    
    // 重置拼图
    resetPuzzle();
    
    // 重置输入框
    const answerInput = document.getElementById('answerInput');
    answerInput.value = '';
    
    // 重置提示
    const hint = document.getElementById('hint');
    hint.innerHTML = '💡 提示：仔细观察线索，它们会告诉你答案！';
    hint.style.background = 'rgba(255, 255, 255, 0.7)';
    hint.style.color = '#666';
    hint.style.fontWeight = 'normal';
    
    // 隐藏庆祝界面
    const celebration = document.getElementById('celebration');
    celebration.style.display = 'none';
    
    // 清理彩带
    const confettiContainer = document.querySelector('.confetti');
    confettiContainer.innerHTML = '';
    
    // 重置小兔子对话
    const speechBubble = document.querySelector('.speech-bubble');
    speechBubble.innerHTML = '<p>你好！我需要你的帮助！</p><p>请帮我解开这个数字谜题吧～</p>';
    
    // 聚焦到输入框
    answerInput.focus();
}

// 添加震动动画
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// 添加一些交互效果
document.addEventListener('DOMContentLoaded', function() {
    // 为所有按钮添加点击效果
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // 为输入框添加焦点效果
    const answerInput = document.getElementById('answerInput');
    answerInput.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
    });
    
    answerInput.addEventListener('blur', function() {
        this.parentElement.style.transform = '';
    });
});
