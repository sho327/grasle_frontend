// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        }
    });
});

// Header Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Grass Animation
function animateGrass() {
    const grassItems = document.querySelectorAll('.grass-item');
    let currentIndex = 0;
    
    setInterval(() => {
        // Remove active class from all items
        grassItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to current items
        for (let i = 0; i <= currentIndex; i++) {
            if (grassItems[i]) {
                grassItems[i].classList.add('active');
            }
        }
        
        currentIndex = (currentIndex + 1) % (grassItems.length + 2);
        if (currentIndex === grassItems.length + 1) {
            currentIndex = 0;
        }
    }, 1000);
}

// Modal Functions
function showNotifyModal() {
    const modal = document.getElementById('notifyModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideNotifyModal() {
    const modal = document.getElementById('notifyModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
document.getElementById('notifyModal').addEventListener('click', (e) => {
    if (e.target.id === 'notifyModal') {
        hideNotifyModal();
    }
});

// Handle notification form
document.querySelector('.notify-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('.notify-input').value;
    
    // Simulate form submission
    alert(`ありがとうございます！${email} に公開通知をお送りします。`);
    hideNotifyModal();
    e.target.reset();
});

// Initialize animations when page loads
document.addEventListener('DOMContentLoaded', () => {
    animateGrass();
    
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    document.querySelectorAll('.service-card, .feature-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});