// ==================== DOM ELEMENTS ====================

// Get navbar element
const navbar = document.getElementById('navbar');

// Get hamburger menu
const hamburger = document.getElementById('hamburger');

// Get navigation menu
const navMenu = document.querySelector('.nav-menu');

// Get all navigation links
const navLinks = document.querySelectorAll('.nav-link');

// Get all sections for scroll animations
const sections = document.querySelectorAll('section');

// ==================== STICKY NAVBAR WITH BLUR EFFECT ====================

// Add scroll event listener to navbar
window.addEventListener('scroll', () => {
    // Add 'scrolled' class when page is scrolled
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Update active navigation link based on scroll position
    updateActiveNavLink();
});

// ==================== MOBILE MENU TOGGLE ====================

// Toggle mobile menu when hamburger is clicked
hamburger.addEventListener('click', () => {
    // Toggle active class on hamburger
    hamburger.classList.toggle('active');
    
    // Toggle active class on navigation menu
    navMenu.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
});

// Close mobile menu when a navigation link is clicked
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Remove active class from hamburger
        hamburger.classList.remove('active');
        
        // Remove active class from navigation menu
        navMenu.classList.remove('active');
        
        // Enable body scroll
        document.body.style.overflow = 'auto';
    });
});

// ==================== SMOOTH SCROLL ====================

// Add smooth scroll to all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        // Prevent default behavior
        e.preventDefault();
        
        // Get target section
        const targetId = this.getAttribute('href');
        
        // Skip if it's just '#'
        if (targetId === '#') return;
        
        const targetSection = document.querySelector(targetId);
        
        // Scroll to target section with smooth behavior
        if (targetSection) {
            const navbarHeight = navbar.offsetHeight;
            const targetPosition = targetSection.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ==================== ACTIVE NAVIGATION LINK ====================

// Function to update active navigation link based on scroll position
function updateActiveNavLink() {
    const scrollPosition = window.scrollY + navbar.offsetHeight + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        // Check if current section is in viewport
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            // Remove active class from all links
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            
            // Add active class to current section's link
            const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}

// ==================== SCROLL ANIMATIONS ====================

// Intersection Observer for scroll animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

// Create intersection observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Add animation class when element comes into view
            entry.target.classList.add('animate-in');
            
            // Stop observing once animated
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections for animation
sections.forEach(section => {
    observer.observe(section);
});

// ==================== TECH CARDS ANIMATION ====================

// Add staggered animation to tech cards
const techCards = document.querySelectorAll('.tech-card');
techCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
});

// ==================== FEATURE CARDS ANIMATION ====================

// Add staggered animation to feature cards
const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
});

// ==================== BUTTON HOVER EFFECTS ====================

// Add ripple effect to buttons
document.querySelectorAll('.btn-primary, .btn-enroll, .btn-buy').forEach(button => {
    button.addEventListener('mouseenter', function(e) {
        // Create ripple element
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        
        // Position ripple
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
        ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
        
        // Add ripple to button
        this.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// ==================== FLOATING ICONS ANIMATION ====================

// Add random movement to floating icons
const floatIcons = document.querySelectorAll('.float-icon');
floatIcons.forEach(icon => {
    // Randomize animation duration slightly
    const randomDuration = 3 + Math.random() * 2;
    icon.style.animationDuration = `${randomDuration}s`;
});

// ==================== PRICING CARD HOVER EFFECT ====================

// Add glow effect to pricing card on hover
const pricingCard = document.querySelector('.pricing-card');
if (pricingCard) {
    pricingCard.addEventListener('mousemove', (e) => {
        const rect = pricingCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update CSS custom properties for glow effect
        pricingCard.style.setProperty('--mouse-x', `${x}px`);
        pricingCard.style.setProperty('--mouse-y', `${y}px`);
    });
}

// ==================== VIDEO PLAY BUTTON ====================

// Add click effect to play button
const playButton = document.querySelector('.play-button');
if (playButton) {
    playButton.addEventListener('click', () => {
        // Add pulse animation
        playButton.style.animation = 'pulse 0.5s ease';
        
        // Remove animation after it completes
        setTimeout(() => {
            playButton.style.animation = '';
        }, 500);
        
        // Show alert (in real implementation, this would open a video modal)
        alert('Video preview would open here in a real implementation!');
    });
}

// ==================== MODULE ITEMS INTERACTION ====================

// Add click effect to module items
const moduleItems = document.querySelectorAll('.module-item');
moduleItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all items
        moduleItems.forEach(i => i.classList.remove('current'));
        
        // Add current class to clicked item
        item.classList.add('current');
    });
});

// ==================== SOCIAL LINKS HOVER EFFECT ====================

// Add subtle animation to social links
const socialLinks = document.querySelectorAll('.social-link');
socialLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(10px)';
    });
    
    link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0)';
    });
});

// ==================== LAZY LOADING FOR IMAGES ====================

// Add lazy loading to images (if any)
const images = document.querySelectorAll('img');
images.forEach(img => {
    img.loading = 'lazy';
});

// ==================== PERFORMANCE OPTIMIZATION ====================

// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounce scroll events for better performance
const debouncedScroll = debounce(() => {
    updateActiveNavLink();
}, 100);

window.addEventListener('scroll', debouncedScroll);

// ==================== ACCESSIBILITY ====================

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    // Close mobile menu with Escape key
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// ==================== INITIALIZATION ====================

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Update active link on load
    updateActiveNavLink();
    
    // Add fade-in animation to body
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// ==================== CONSOLE MESSAGE ====================

// Log welcome message to console
console.log('%c SSSAM Academy Landing Page ', 'background: linear-gradient(135deg, #7c3aed, #2563eb); color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px; font-weight: bold;');
console.log('%c Built with HTML, CSS, and Vanilla JavaScript ', 'color: #9ca3af; font-size: 12px;');
