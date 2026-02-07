// Custom Futuristic Cursor
document.addEventListener('DOMContentLoaded', () => {
    // Only on desktop
    if (window.innerWidth > 768) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.innerHTML = `
            <div class="cursor-main">
                <div class="cursor-diamond"></div>
            </div>
            <div class="cursor-follower"></div>
        `;
        document.body.appendChild(cursor);

        const cursorMain = cursor.querySelector('.cursor-main');
        const cursorFollower = cursor.querySelector('.cursor-follower');

        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorMain.style.left = mouseX + 'px';
            cursorMain.style.top = mouseY + 'px';
        });

        // Smooth follower
        function animateFollower() {
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;
            cursorFollower.style.left = followerX + 'px';
            cursorFollower.style.top = followerY + 'px';
            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        // Hover effects
        document.querySelectorAll('button, a, input, .clickable, .friend-card, .channel-item').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
        });
    }
});

// Create floating particles
function createParticles() {
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        document.body.appendChild(particle);
    }
}

// Initialize particles
if (window.innerWidth > 768) {
    createParticles();
}

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in').forEach(el => {
    observer.observe(el);
});

// Add gradient text effect to titles
document.querySelectorAll('h1, h2, .title').forEach(el => {
    if (!el.classList.contains('gradient-text')) {
        el.classList.add('gradient-text');
    }
});

// Add shimmer effect to buttons
document.querySelectorAll('.modern-btn, .auth-btn, .primary-btn').forEach(btn => {
    if (!btn.classList.contains('shimmer')) {
        btn.classList.add('shimmer');
    }
});
