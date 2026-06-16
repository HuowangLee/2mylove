// 创建动态粒子效果
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: hsl(${Math.random() * 60 + 180}, 100%, 50%);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particleFloat ${Math.random() * 10 + 5}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        particlesContainer.appendChild(particle);
    }
}

// 添加粒子浮动动画
const style = document.createElement('style');
style.textContent = `
    @keyframes particleFloat {
        0% {
            transform: translateY(100vh) translateX(0px) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) translateX(${Math.random() * 200 - 100}px) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 鼠标交互效果
function addMouseEffects() {
    const container = document.querySelector('.container');
    const mainNumber = document.querySelector('.main-number');
    
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        // 3D倾斜效果
        const rotateX = (y - 0.5) * 20;
        const rotateY = (x - 0.5) * 20;
        
        mainNumber.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.1)`;
        
        // 动态发光效果
        const glowEffect = document.querySelector('.glow-effect');
        glowEffect.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, 
            rgba(255, 0, 255, 0.4) 0%, 
            rgba(0, 255, 255, 0.3) 30%, 
            transparent 70%)`;
    });
    
    container.addEventListener('mouseleave', () => {
        mainNumber.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        const glowEffect = document.querySelector('.glow-effect');
        glowEffect.style.background = 'radial-gradient(circle, rgba(255, 0, 255, 0.3) 0%, transparent 70%)';
    });
}

// 键盘交互效果
function addKeyboardEffects() {
    document.addEventListener('keydown', (e) => {
        const mainNumber = document.querySelector('.main-number');
        
        // 按任意键触发特殊效果
        mainNumber.style.animation = 'none';
        mainNumber.offsetHeight; // 触发重排
        mainNumber.style.animation = 'gradientShift 0.5s ease-in-out, pulse 0.5s ease-in-out, rotate3d 0.5s ease-in-out';
        
        // 创建爆炸效果
        createExplosionEffect();
    });
}

// 爆炸效果
function createExplosionEffect() {
    const container = document.querySelector('.container');
    const explosion = document.createElement('div');
    explosion.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 0;
        height: 0;
        border: 2px solid #ffff00;
        border-radius: 50%;
        animation: explosion 0.6s ease-out forwards;
        pointer-events: none;
        z-index: 100;
    `;
    
    container.appendChild(explosion);
    
    setTimeout(() => {
        explosion.remove();
    }, 600);
}

// 添加爆炸动画
const explosionStyle = document.createElement('style');
explosionStyle.textContent = `
    @keyframes explosion {
        0% {
            width: 0;
            height: 0;
            opacity: 1;
            border-color: #ffff00;
        }
        50% {
            width: 200px;
            height: 200px;
            opacity: 0.8;
            border-color: #ff00ff;
        }
        100% {
            width: 400px;
            height: 400px;
            opacity: 0;
            border-color: #00ffff;
        }
    }
`;
document.head.appendChild(explosionStyle);

// 数字变换效果
function addNumberTransformation() {
    const digits = document.querySelectorAll('.digit');
    
    setInterval(() => {
        digits.forEach((digit, index) => {
            if (Math.random() < 0.1) { // 10% 概率触发
                digit.style.transform = 'scale(1.3) rotate(360deg)';
                digit.style.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
                
                setTimeout(() => {
                    digit.style.transform = '';
                    digit.style.color = '';
                }, 500);
            }
        });
    }, 2000);
}

// 创建动态背景
function createDynamicBackground() {
    const body = document.body;
    
    setInterval(() => {
        const hue = Math.random() * 360;
        body.style.background = `
            radial-gradient(circle at ${Math.random() * 100}% ${Math.random() * 100}%, 
                hsl(${hue}, 20%, 5%) 0%, 
                #000 50%, 
                hsl(${(hue + 180) % 360}, 20%, 5%) 100%)
        `;
    }, 5000);
}

// 添加音效模拟（视觉反馈）
function addVisualSoundEffects() {
    const container = document.querySelector('.container');
    
    // 模拟节拍效果
    setInterval(() => {
        const beat = document.createElement('div');
        beat.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 10px;
            height: 10px;
            background: #ffff00;
            border-radius: 50%;
            animation: beatPulse 0.3s ease-out forwards;
            pointer-events: none;
            z-index: 50;
        `;
        
        container.appendChild(beat);
        
        setTimeout(() => {
            beat.remove();
        }, 300);
    }, 1000);
}

// 添加节拍动画
const beatStyle = document.createElement('style');
beatStyle.textContent = `
    @keyframes beatPulse {
        0% {
            width: 10px;
            height: 10px;
            opacity: 1;
        }
        100% {
            width: 100px;
            height: 100px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(beatStyle);

// 全屏点击效果
function addFullscreenClickEffect() {
    document.addEventListener('click', (e) => {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            top: ${e.clientY}px;
            left: ${e.clientX}px;
            transform: translate(-50%, -50%);
            width: 0;
            height: 0;
            border: 2px solid #00ffff;
            border-radius: 50%;
            animation: ripple 1s ease-out forwards;
            pointer-events: none;
            z-index: 1000;
        `;
        
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 1000);
    });
}

// 添加涟漪动画
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        0% {
            width: 0;
            height: 0;
            opacity: 1;
        }
        100% {
            width: 300px;
            height: 300px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// 初始化所有效果
function init() {
    createParticles();
    addMouseEffects();
    addKeyboardEffects();
    addNumberTransformation();
    createDynamicBackground();
    addVisualSoundEffects();
    addFullscreenClickEffect();
    
    // 页面加载完成后的欢迎效果
    setTimeout(() => {
        const mainNumber = document.querySelector('.main-number');
        mainNumber.style.animation = 'gradientShift 2s ease-in-out, pulse 2s ease-in-out, rotate3d 2s ease-in-out';
    }, 1000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

// 添加页面可见性变化效果
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面隐藏时暂停动画
        document.body.style.animationPlayState = 'paused';
    } else {
        // 页面显示时恢复动画
        document.body.style.animationPlayState = 'running';
    }
});

// 添加窗口大小变化响应
window.addEventListener('resize', () => {
    // 重新计算粒子位置
    const particles = document.querySelectorAll('.particle');
    particles.forEach(particle => {
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
    });
});

