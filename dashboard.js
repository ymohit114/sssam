// ==================== DASHBOARD JAVASCRIPT ====================

// API Configuration
const API_BASE_URL = 'http://localhost:5000';

// ==================== SUCCESS MODAL FUNCTIONS ====================

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

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        // Redirect to login page
        window.location.href = 'index.html';
        return false;
    }
    
    return { token, user: JSON.parse(user) };
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// ==================== API HELPER FUNCTIONS ====================

// Generic API request function
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Add auth token
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
        
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
            throw new Error('Session expired. Please login again.');
        }
        
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

// ==================== DASHBOARD FUNCTIONS ====================

// Fetch user dashboard data
async function fetchDashboardData() {
    try {
        const response = await apiRequest('/api/dashboard');
        
        if (response.success) {
            return response.data;
        } else {
            throw new Error('Failed to fetch dashboard data');
        }
    } catch (error) {
        throw error;
    }
}

// Update UI with user data
function updateUI(userData) {
    // Update user name in navbar
    const navbarUserName = document.getElementById('navbarUserName');
    if (navbarUserName) {
        navbarUserName.textContent = userData.user.name;
    }
    
    // Update welcome message
    const welcomeUserName = document.getElementById('welcomeUserName');
    if (welcomeUserName) {
        welcomeUserName.textContent = userData.user.name;
    }
    
    // Update user info
    const userEmail = document.getElementById('userEmail');
    if (userEmail) {
        userEmail.textContent = userData.user.email;
    }
    
    // Update member since date
    const memberSince = document.getElementById('memberSince');
    if (memberSince) {
        const createdDate = new Date(userData.user.createdAt);
        memberSince.textContent = createdDate.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Update last login
    const lastLogin = document.getElementById('lastLogin');
    if (lastLogin) {
        lastLogin.textContent = 'Just now';
    }
    
    // Update stats
    updateStats(userData);
    
    // Update course status
    updateCourseStatus(userData);
}

// Update dashboard statistics
function updateStats(userData) {
    const coursesCount = document.getElementById('coursesCount');
    const progressPercent = document.getElementById('progressPercent');
    const daysActive = document.getElementById('daysActive');
    
    if (coursesCount) {
        coursesCount.textContent = userData.purchasedCourse ? '1' : '0';
    }
    
    if (progressPercent) {
        progressPercent.textContent = userData.purchasedCourse ? '0%' : 'N/A';
    }
    
    if (daysActive) {
        // Calculate days active since registration
        const createdDate = new Date(userData.user.createdAt);
        const today = new Date();
        const daysDiff = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
        daysActive.textContent = daysDiff > 0 ? daysDiff : 1;
    }
}

// Update course status based on purchase
function updateCourseStatus(userData) {
    const courseStatus = document.getElementById('courseStatus');
    
    if (!courseStatus) return;
    
    if (userData.purchasedCourse) {
        // User has purchased the course
        courseStatus.innerHTML = `
            <div class="course-purchased">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Course Purchased ✅
            </div>
        `;
    } else {
        // User has not purchased the course
        courseStatus.innerHTML = `
            <div class="course-info">
                <div class="course-price">
                    <span class="old-price">₹1999</span>
                    <span class="offer-price">₹9 Only</span>
                </div>
                <p class="launch-offer-text">🔥 Launch Offer - Limited Time!</p>
                <a href="payment.html" class="btn-buy-course">Buy Course</a>
            </div>
        `;
    }
}

// Show error state
function showError(message) {
    const loadingState = document.getElementById('loadingState');
    const errorCard = document.getElementById('errorCard');
    const errorMessage = document.getElementById('errorMessage');
    
    if (loadingState) {
        loadingState.style.display = 'none';
    }
    
    if (errorCard) {
        errorCard.style.display = 'block';
    }
    
    if (errorMessage) {
        errorMessage.textContent = message;
    }
}

// Hide error state
function hideError() {
    const errorCard = document.getElementById('errorCard');
    if (errorCard) {
        errorCard.style.display = 'none';
    }
}

// Show loading state
function showLoading() {
    const loadingState = document.getElementById('loadingState');
    const mainContent = document.querySelector('.welcome-section, .user-info-section, .course-section');
    
    if (loadingState) {
        loadingState.style.display = 'block';
    }
    
    if (mainContent) {
        mainContent.style.display = 'none';
    }
}

// Hide loading state
function hideLoading() {
    const loadingState = document.getElementById('loadingState');
    const mainContent = document.querySelector('.welcome-section, .user-info-section, .course-section');
    
    if (loadingState) {
        loadingState.style.display = 'none';
    }
    
    if (mainContent) {
        mainContent.style.display = 'block';
    }
}

// Initialize dashboard
async function initializeDashboard() {
    try {
        // Check authentication first
        const auth = checkAuth();
        if (!auth) return;
        
        // Show loading state
        showLoading();
        
        // Fetch dashboard data
        const userData = await fetchDashboardData();
        
        // Hide loading state
        hideLoading();
        
        // Update UI with user data
        updateUI(userData);
        
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        
        // Hide loading state
        hideLoading();
        
        // Show error message
        showError(error.message || 'Failed to load dashboard. Please try again.');
    }
}

// ==================== EVENT LISTENERS ====================

// Logout button
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // For logout, we'll just show a success modal and logout
            showSuccessModal('Logging Out...', 'Redirecting to home page...', 'index.html', 1500);
            
            // Clear localStorage after short delay
            setTimeout(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }, 1000);
        });
    }
    
    // Retry button
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
        retryBtn.addEventListener('click', function() {
            hideError();
            initializeDashboard();
        });
    }
    
    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobileToggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            const userSection = document.querySelector('.user-section');
            if (userSection) {
                userSection.classList.toggle('mobile-active');
            }
        });
    }
    
    // Initialize dashboard
    initializeDashboard();
});

// ==================== AUTO REFRESH (Optional) ====================

// Refresh dashboard data every 5 minutes
setInterval(() => {
    const token = localStorage.getItem('token');
    if (token && window.location.pathname.includes('dashboard.html')) {
        fetchDashboardData()
            .then(userData => {
                updateUI(userData);
            })
            .catch(error => {
                console.error('Auto refresh error:', error);
            });
    }
}, 5 * 60 * 1000); // 5 minutes
