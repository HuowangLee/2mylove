// 金铲铲S15天下无双 - 阵容数据
const compositions = [
    {
        name: "斗魂永恩",
        pieces: [
            { name: "永恩", cost: 5 },
            { name: "莎弥拉", cost: 4 },
            { name: "瑟提", cost: 4 },
            { name: "格温", cost: 5 },
            { name: "赵信", cost: 2 }
        ],
        bonds: ["斗魂战士", "刀锋领主", "主宰"],
        hint: "这是S15最强势的阵容之一！双C永恩和莎弥拉配合斗魂羁绊伤害爆炸！",
        options: ["斗魂永恩", "奥德赛", "战斗学院", "护卫狙神"]
    },
    {
        name: "奥德赛",
        pieces: [
            { name: "崔斯特", cost: 5 },
            { name: "希维尔", cost: 1 },
            { name: "瑞兹", cost: 4 },
            { name: "墨菲特", cost: 2 },
            { name: "吉格斯", cost: 3 }
        ],
        bonds: ["奥德赛", "司令", "卡牌大师"],
        hint: "全三星暴力阵容！卡牌大师崔斯特是主C，配合奥德赛羁绊超强！",
        options: ["奥德赛", "斗魂永恩", "天才拉莫斯", "战斗学院"]
    },
    {
        name: "战斗学院",
        pieces: [
            { name: "悠米", cost: 4 },
            { name: "伊泽瑞尔", cost: 1 },
            { name: "凯特琳", cost: 3 },
            { name: "杰斯", cost: 3 },
            { name: "波比", cost: 4 }
        ],
        bonds: ["战斗学院", "天才", "星之守护者"],
        hint: "悠米当主C的法师阵容，配合战斗学院羁绊控制力强！",
        options: ["战斗学院", "奥德赛", "斗魂永恩", "护卫狙神"]
    },
    {
        name: "天才拉莫斯",
        pieces: [
            { name: "拉莫斯", cost: 3 },
            { name: "辛德拉", cost: 1 },
            { name: "悠米", cost: 4 },
            { name: "萨勒芬妮", cost: 5 },
            { name: "妮蔻", cost: 3 }
        ],
        bonds: ["天才", "星之守护者", "至高天"],
        hint: "坦克流阵容！拉莫斯配合天才羁绊既肉又有输出！",
        options: ["天才拉莫斯", "战斗学院", "斗魂永恩", "奥德赛"]
    },
    {
        name: "护卫狙神",
        pieces: [
            { name: "凯特琳", cost: 3 },
            { name: "烬", cost: 2 },
            { name: "金克丝", cost: 4 },
            { name: "蕾欧娜", cost: 4 },
            { name: "布隆", cost: 5 }
        ],
        bonds: ["狙神", "护卫", "至高天"],
        hint: "经典射手阵容！凯特琳作为主C配合狙神和护卫羁绊攻守兼备！",
        options: ["护卫狙神", "天才拉莫斯", "战斗学院", "斗魂永恩"]
    }
];

// 游戏状态
let currentLevel = 0;
let hintUsed = false;
let canAnswer = true;

// DOM元素
const progressFill = document.getElementById('progressFill');
const currentLevelSpan = document.getElementById('currentLevel');
const totalLevelsSpan = document.getElementById('totalLevels');
const piecesGrid = document.getElementById('piecesGrid');
const bondsGrid = document.getElementById('bondsGrid');
const optionsGrid = document.getElementById('optionsGrid');
const hintSection = document.getElementById('hintSection');
const hintText = document.getElementById('hintText');
const hintBtn = document.getElementById('hintBtn');
const feedback = document.getElementById('feedback');
const victoryScreen = document.getElementById('victoryScreen');
const restartBtn = document.getElementById('restartBtn');
const fireworks = document.getElementById('fireworks');

// 初始化游戏
function initGame() {
    totalLevelsSpan.textContent = compositions.length;
    loadLevel();
}

// 加载关卡
function loadLevel() {
    if (currentLevel >= compositions.length) {
        showVictory();
        return;
    }

    const comp = compositions[currentLevel];
    hintUsed = false;
    canAnswer = true;

    // 更新进度
    currentLevelSpan.textContent = currentLevel + 1;
    progressFill.style.width = ((currentLevel + 1) / compositions.length * 100) + '%';

    // 显示棋子
    piecesGrid.innerHTML = '';
    comp.pieces.forEach(piece => {
        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'piece-item';
        pieceDiv.innerHTML = `${piece.name}<span class="piece-cost">${piece.cost}费</span>`;
        pieceDiv.style.animation = 'fadeIn 0.5s ease';
        piecesGrid.appendChild(pieceDiv);
    });

    // 显示羁绊
    bondsGrid.innerHTML = '';
    comp.bonds.forEach(bond => {
        const bondDiv = document.createElement('div');
        bondDiv.className = 'bond-item';
        bondDiv.textContent = bond;
        bondDiv.style.animation = 'fadeIn 0.5s ease';
        bondsGrid.appendChild(bondDiv);
    });

    // 显示选项
    optionsGrid.innerHTML = '';
    const shuffledOptions = shuffleArray([...comp.options]);
    shuffledOptions.forEach(option => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        optionBtn.textContent = option;
        optionBtn.onclick = () => checkAnswer(option);
        optionsGrid.appendChild(optionBtn);
    });

    // 重置提示
    hintSection.style.display = 'none';
    hintBtn.disabled = false;
    hintBtn.textContent = '💡 需要提示？';
}

// 打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 检查答案
function checkAnswer(answer) {
    if (!canAnswer) return;

    const comp = compositions[currentLevel];
    const buttons = optionsGrid.querySelectorAll('.option-btn');

    if (answer === comp.name) {
        // 答案正确
        canAnswer = false;
        buttons.forEach(btn => {
            if (btn.textContent === answer) {
                btn.classList.add('correct');
            }
        });

        showFeedback('正确！🎉', true);
        
        setTimeout(() => {
            currentLevel++;
            loadLevel();
        }, 1500);
    } else {
        // 答案错误
        buttons.forEach(btn => {
            if (btn.textContent === answer) {
                btn.classList.add('wrong');
                setTimeout(() => {
                    btn.classList.remove('wrong');
                }, 500);
            }
        });

        showFeedback('再想想！💪', false);
    }
}

// 显示反馈
function showFeedback(message, isCorrect) {
    feedback.textContent = message;
    feedback.className = 'feedback show ' + (isCorrect ? 'correct' : 'wrong');
    
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 1500);
}

// 显示提示
hintBtn.addEventListener('click', () => {
    if (!hintUsed) {
        const comp = compositions[currentLevel];
        hintText.textContent = comp.hint;
        hintSection.style.display = 'block';
        hintUsed = true;
        hintBtn.disabled = true;
        hintBtn.textContent = '✓ 提示已使用';
    }
});

// 显示通关页面
function showVictory() {
    victoryScreen.style.display = 'flex';
    createFireworks();
    playConfetti();
}

// 创建烟花效果
function createFireworks() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const spark = document.createElement('div');
            spark.style.position = 'absolute';
            spark.style.width = '10px';
            spark.style.height = '10px';
            spark.style.borderRadius = '50%';
            spark.style.backgroundColor = ['#283593', '#5e35b1', '#ff6f00', '#fff'][Math.floor(Math.random() * 4)];
            spark.style.left = Math.random() * 100 + '%';
            spark.style.top = Math.random() * 100 + '%';
            spark.style.animation = 'sparkle 1s ease-out forwards';
            fireworks.appendChild(spark);

            setTimeout(() => spark.remove(), 1000);
        }, i * 100);
    }
}

// 添加闪烁动画
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkle {
        0% { transform: scale(0) translateY(0); opacity: 1; }
        100% { transform: scale(2) translateY(-50px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// 彩屑效果
function playConfetti() {
    const confettiCount = 100;
    const victoryContent = document.querySelector('.victory-content');
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = ['#283593', '#5e35b1', '#ff6f00', '#fff', '#b39ddb'][Math.floor(Math.random() * 5)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.animation = `fall ${2 + Math.random() * 3}s linear forwards`;
            victoryContent.appendChild(confetti);

            setTimeout(() => confetti.remove(), 5000);
        }, i * 30);
    }
}

// 添加下落动画
const fallStyle = document.createElement('style');
fallStyle.textContent = `
    @keyframes fall {
        to { 
            transform: translateY(600px) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(fallStyle);

// 重新开始
restartBtn.addEventListener('click', () => {
    currentLevel = 0;
    victoryScreen.style.display = 'none';
    loadLevel();
});

// 初始化游戏
initGame();

