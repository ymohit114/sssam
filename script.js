// ==================== DOM ELEMENTS ====================

// Get navbar element
const navbar = document.getElementById('navbar');

// Get hamburger menu
const hamburger = document.getElementById('hamburger');

// Get navigation menu
const navMenu = document.querySelector('.nav-menu');

// Get mobile menu
const mobileMenu = document.querySelector('.mobile-menu');

// Get all navigation links
const navLinks = document.querySelectorAll('.nav-link');

// Get all sections for scroll animations
const sections = document.querySelectorAll('section');

// Get sticky banner
const topOfferBanner = document.querySelector('.top-offer-banner');

// Get banner close button
const bannerClose = document.querySelector('.banner-close');

// Get auth buttons
const navAuth = document.querySelector('.nav-auth');
const navUser = document.querySelector('.nav-user');
const btnLogin = document.querySelector('.btn-login');
const btnEnroll = document.querySelector('.btn-enroll');
const btnDashboard = document.querySelector('.btn-dashboard');
const btnLogoutNav = document.querySelector('.btn-logout-nav');

// ==================== STICKY BANNER CLOSE ====================

// Close sticky banner when close button is clicked
if (bannerClose && topOfferBanner) {
    bannerClose.addEventListener('click', () => {
        topOfferBanner.classList.add('hidden');
        navbar.classList.add('no-banner');
        
        // Save banner state to localStorage
        localStorage.setItem('bannerClosed', 'true');
    });
}

// Check if banner was previously closed
if (topOfferBanner && localStorage.getItem('bannerClosed') === 'true') {
    topOfferBanner.classList.add('hidden');
    navbar.classList.add('no-banner');
}

// ==================== AUTH-AWARE NAVBAR ====================

// Check if user is logged in
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (token && user) {
        // User is logged in
        if (navAuth) navAuth.style.display = 'none';
        if (navUser) navUser.style.display = 'flex';
    } else {
        // User is not logged in
        if (navAuth) navAuth.style.display = 'flex';
        if (navUser) navUser.style.display = 'none';
    }
}

// Run auth check on page load
checkAuthStatus();

// Logout functionality
if (btnLogoutNav) {
    btnLogoutNav.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Update navbar
        checkAuthStatus();
        
        // Show success message
        showSuccessModal('Logged out successfully!');
    });
}

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
if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        // Toggle active class on hamburger
        hamburger.classList.toggle('active');
        
        // Toggle active class on mobile menu
        mobileMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
    });
}

// Close mobile menu when a navigation link is clicked
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Remove active class from hamburger
        hamburger.classList.remove('active');
        
        // Remove active class from mobile menu
        mobileMenu.classList.remove('active');
        
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
            const bannerHeight = topOfferBanner && !topOfferBanner.classList.contains('hidden') ? topOfferBanner.offsetHeight : 0;
            const targetPosition = targetSection.offsetTop - navbarHeight - bannerHeight;
            
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
    // Check if navbar exists
    if (!navbar) return;
    
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

// ==================== AUTHENTICATION CHECK ====================

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        // Only redirect to login if not on login page
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
        return false;
    }
    
    return { token, user: JSON.parse(user) };
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html#home';
}

// ==================== SMOOTH SCROLL HANDLING ====================

// Handle smooth scroll to anchor on page load
function handleSmoothScroll() {
    const hash = window.location.hash;
    if (hash === '#home') {
        setTimeout(() => {
            const heroSection = document.getElementById('home');
            if (heroSection) {
                heroSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);
    }
}

// ==================== INITIALIZATION ====================

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication for protected pages
    if (window.location.pathname.includes('payment.html') || 
        window.location.pathname.includes('success.html') ||
        window.location.pathname.includes('dashboard.html')) {
        checkAuth();
    }
    
    // Handle smooth scroll for anchor links
    handleSmoothScroll();
    
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

// ==================== ENROLL BUTTON FLOW ====================

// Handle enroll button click
function handleEnrollClick(e) {
    e.preventDefault();
    console.log('Enroll button clicked');
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('Auth check - Token:', !!token, 'User:', !!user);
    
    if (!token || !user) {
        // User not logged in - open login modal
        console.log('User not logged in, opening login modal');
        if (typeof openModal === 'function') {
            openModal();
        }
    } else {
        // User already logged in - redirect to dashboard
        console.log('User already logged in, redirecting to dashboard');
        window.location.href = 'dashboard.html';
    }
}

// Add event listeners to enroll buttons
document.querySelectorAll('.btn-enroll, .btn-enroll-mobile, .pricing-card .btn-primary').forEach(btn => {
    if (btn) {
        btn.addEventListener('click', handleEnrollClick);
        console.log('Enroll button event listener added');
    }
});

// ==================== AUTH MODAL FUNCTIONALITY ====================

// Get modal elements
const authModal = document.getElementById('authModal');
const closeModal = document.getElementById('closeModal');
const switchAuth = document.getElementById('switchAuth');
const switchText = document.getElementById('switchText');
const modalTitle = document.getElementById('modalTitle');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Get enroll buttons to open modal
const enrollButtons = document.querySelectorAll('.btn-primary, .btn-enroll, .btn-buy');

// Open modal when enroll button is clicked
enrollButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Check if the link is to #pricing (stay on landing page)
        const href = button.getAttribute('href');
        if (href === '#pricing' || href === '#') {
            e.preventDefault();
            openModal();
        }
    });
});

// Function to open modal
function openModal() {
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Function to close modal
function closeModalFunc() {
    if (authModal) {
        authModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Close modal when close button is clicked
if (closeModal) {
    closeModal.addEventListener('click', closeModalFunc);
}

// Close modal when clicking outside the modal container
if (authModal) {
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            closeModalFunc();
        }
    });
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal && authModal.classList.contains('active')) {
        closeModalFunc();
    }
});

// Switch between login and signup forms
let isLoginMode = true;

if (switchAuth) {
    switchAuth.addEventListener('click', (e) => {
        e.preventDefault();
    
    if (isLoginMode) {
        // Switch to signup
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
        modalTitle.textContent = 'Create Your Account';
        switchText.textContent = 'Already have an account?';
        switchAuth.textContent = 'Login';
    } else {
        // Switch to login
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
        modalTitle.textContent = 'Login to Your Account';
        switchText.textContent = "Don't have an account?";
        switchAuth.textContent = 'Sign Up';
    }
    
    isLoginMode = !isLoginMode;
});

// ==================== API CONFIGURATION ====================
const API_BASE_URL = 'http://localhost:5000';

// ==================== API HELPER FUNCTIONS ====================

// Generic API request function
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
        defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    const requestOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, requestOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==================== SUCCESS MODAL FUNCTION ====================

// Show success modal with custom title and message
function showSuccessModal(title, message, redirectUrl, delay = 2000) {
    const successModal = document.getElementById('successModal');
    const successModalTitle = document.getElementById('successModalTitle');
    const successModalMessage = document.getElementById('successModalMessage');
    const loaderBar = document.querySelector('.loader-bar');
    
    // Set custom title and message
    if (title) successModalTitle.textContent = title;
    if (message) successModalMessage.textContent = message;
    
    // Show modal
    successModal.classList.add('active');
    
    // Reset loader animation
    loaderBar.style.animation = 'none';
    loaderBar.offsetHeight; // Trigger reflow
    loaderBar.style.animation = 'loadProgress 2s ease forwards';
    
    // Auto redirect after delay
    setTimeout(() => {
        // Fade out modal
        successModal.style.opacity = '0';
        successModal.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            // Redirect
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                // Just hide modal if no redirect
                successModal.classList.remove('active');
                successModal.style.opacity = '';
                successModal.style.transition = '';
            }
        }, 300);
    }, delay);
}

// Show error modal (reusing success modal with error styling)
function showErrorModal(title, message) {
    const successModal = document.getElementById('successModal');
    const successModalTitle = document.getElementById('successModalTitle');
    const successModalMessage = document.getElementById('successModalMessage');
    const successIcon = document.querySelector('.success-icon');
    const loaderBar = document.querySelector('.loader-bar');
    
    // Set error title and message
    if (title) successModalTitle.textContent = title;
    if (message) successModalMessage.textContent = message;
    
    // Change icon to error (red)
    successIcon.style.color = '#ef4444';
    successIcon.style.borderColor = '#ef4444';
    successIcon.style.background = 'rgba(239, 68, 68, 0.1)';
    successIcon.innerHTML = `
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    `;
    
    // Hide loader
    loaderBar.style.display = 'none';
    
    // Show modal
    successModal.classList.add('active');
    
    // Auto close after 3 seconds
    setTimeout(() => {
        successModal.classList.remove('active');
        
        // Reset to success state
        setTimeout(() => {
            successIcon.style.color = '#22c55e';
            successIcon.style.borderColor = '#22c55e';
            successIcon.style.background = 'rgba(34, 197, 94, 0.1)';
            successIcon.innerHTML = `
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
            loaderBar.style.display = 'block';
        }, 300);
    }, 3000);
}

// ==================== AUTHENTICATION FUNCTIONS ====================

// Handle login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Show loading state
    const submitBtn = loginForm.querySelector('.btn-auth');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    try {
        const response = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        if (response.success) {
            // Store JWT token in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // Close auth modal
            closeModalFunc();
            
            // Show success modal and redirect
            showSuccessModal('Login Successful 🎉', 'Redirecting to your dashboard...', 'dashboard.html');
        } else {
            throw new Error('Login failed');
        }
    } catch (error) {
        // Show error modal
        showErrorModal('Login Failed', error.message || 'Unable to login. Please try again.');
        
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
    });
}

// Handle signup form submission
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        
        // Validate password match
        if (password !== confirmPassword) {
            showErrorModal('Validation Error', 'Passwords do not match!');
            return;
        }
        
        // Show loading state
        const submitBtn = signupForm.querySelector('.btn-auth');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating account...';
        submitBtn.disabled = true;
        
        try {
            const response = await apiRequest('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({ name, email, password }),
            });
            
            if (response.success) {
                // Store JWT token in localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Close auth modal
                closeModalFunc();
                
                // Show success modal and redirect
                showSuccessModal('Account Created 🎉', 'Redirecting to your dashboard...', 'dashboard.html');
            } else {
                throw new Error('Signup failed');
            }
        } catch (error) {
            // Show error modal
            showErrorModal('Signup Failed', error.message || 'Unable to create account. Please try again.');
            
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}
}