// ==================== DASHBOARD JAVASCRIPT ====================

// API Base URL
const API_BASE_URL = 'http://localhost:5000';

// ==================== SIDEBAR FUNCTIONALITY ====================

// Get sidebar elements
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarClose = document.getElementById('sidebarClose');
const sidebarLinks = document.querySelectorAll('.sidebar-link');

// Toggle sidebar
if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : 'auto';
    });
}

// Close sidebar
if (sidebarClose && sidebar) {
    sidebarClose.addEventListener('click', () => {
        sidebar.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
}

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    if (sidebar && sidebar.classList.contains('active')) {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
});

// ==================== SECTION SWITCHING ====================

// Show specific section
function showSection(sectionName) {
    console.log(`Dashboard: Switching to ${sectionName} section`);
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(`${sectionName}Section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update sidebar active state
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('active');
        }
    });
    
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Add event listeners to sidebar links
sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionName = link.getAttribute('data-section');
        if (sectionName) {
            showSection(sectionName);
        }
    });
});

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
    console.log('Dashboard: Updating UI with user data...', userData);
    
    const user = userData.user;
    
    // Update user name in navbar
    const navbarUserName = document.getElementById('navbarUserName');
    if (navbarUserName) {
        navbarUserName.textContent = user.name;
        console.log('Dashboard: Navbar username updated');
    }
    
    // Update welcome message
    const welcomeUserName = document.getElementById('welcomeUserName');
    if (welcomeUserName) {
        welcomeUserName.textContent = user.name;
        console.log('Dashboard: Welcome username updated');
    }
    
    // Update sidebar user info
    const sidebarUserName = document.getElementById('sidebarUserName');
    const sidebarUserEmail = document.getElementById('sidebarUserEmail');
    const sidebarUserInitial = document.getElementById('sidebarUserInitial');
    
    if (sidebarUserName) {
        sidebarUserName.textContent = user.name;
    }
    if (sidebarUserEmail) {
        sidebarUserEmail.textContent = user.email;
    }
    if (sidebarUserInitial) {
        sidebarUserInitial.textContent = user.name.charAt(0).toUpperCase();
    }
    
    // Update profile section
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileAvatarInitial = document.getElementById('profileAvatarInitial');
    
    if (profileName) {
        profileName.textContent = user.name;
    }
    if (profileEmail) {
        profileEmail.textContent = user.email;
    }
    if (profileAvatarInitial) {
        profileAvatarInitial.textContent = user.name.charAt(0).toUpperCase();
    }
    
    // Update user info
    const userEmail = document.getElementById('userEmail');
    if (userEmail) {
        userEmail.textContent = user.email;
        console.log('Dashboard: User email updated');
    }
    
    // Update member since date
    const memberSince = document.getElementById('memberSince');
    if (memberSince) {
        const createdDate = new Date(user.createdAt);
        memberSince.textContent = createdDate.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        console.log('Dashboard: Member since date updated');
    }
    
    // Update last login
    const lastLogin = document.getElementById('lastLogin');
    if (lastLogin) {
        lastLogin.textContent = 'Just now';
        console.log('Dashboard: Last login updated');
    }
    
    // Update stats
    updateStats(userData);
    
    // Update course status
    updateCourseStatus(userData);
    
    // Update progress section
    updateProgressSection(userData);
}

// Update progress section
function updateProgressSection(userData) {
    console.log('Dashboard: Updating progress section...');
    
    const circularProgressPercent = document.getElementById('circularProgressPercent');
    const progressCircle = document.getElementById('progressCircle');
    const modulesCompleted = document.getElementById('modulesCompleted');
    const hoursLearned = document.getElementById('hoursLearned');
    const projectsCompleted = document.getElementById('projectsCompleted');
    
    // Calculate progress (placeholder logic)
    const progress = userData.purchasedCourse ? 25 : 0; // 25% for demo
    
    if (circularProgressPercent) {
        circularProgressPercent.textContent = `${progress}%`;
    }
    
    if (progressCircle) {
        // Animate circular progress
        const circumference = 565.48;
        const offset = circumference - (progress / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
    }
    
    if (modulesCompleted) {
        modulesCompleted.textContent = userData.purchasedCourse ? '5' : '0';
    }
    
    if (hoursLearned) {
        hoursLearned.textContent = userData.purchasedCourse ? '12' : '0';
    }
    
    if (projectsCompleted) {
        projectsCompleted.textContent = userData.purchasedCourse ? '2' : '0';
    }
}

// Update dashboard statistics
function updateStats(userData) {
    console.log('Dashboard: Updating statistics...');
    const coursesCount = document.getElementById('coursesCount');
    const progressPercent = document.getElementById('progressPercent');
    const daysActive = document.getElementById('daysActive');
    
    if (coursesCount) {
        coursesCount.textContent = userData.purchasedCourse ? '1' : '0';
        console.log('Dashboard: Courses count updated to', userData.purchasedCourse ? '1' : '0');
    }
    
    if (progressPercent) {
        progressPercent.textContent = userData.purchasedCourse ? '0%' : 'N/A';
        console.log('Dashboard: Progress updated to', userData.purchasedCourse ? '0%' : 'N/A');
    }
    
    if (daysActive) {
        // Calculate days active since registration
        const createdDate = new Date(userData.user.createdAt);
        const today = new Date();
        const daysDiff = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
        daysActive.textContent = daysDiff > 0 ? daysDiff : 1;
        console.log('Dashboard: Days active calculated as', daysDiff > 0 ? daysDiff : 1);
    }
}

// Update course status based on purchase
function updateCourseStatus(userData) {
    console.log('Dashboard: Updating course status...');
    const courseStatus = document.getElementById('courseStatus');
    
    if (!courseStatus) {
        console.warn('Dashboard: Course status element not found');
        return;
    }
    
    if (userData.purchasedCourse) {
        // User has purchased the course
        console.log('Dashboard: Course purchased - showing purchased status');
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
        console.log('Dashboard: Course not purchased - showing buy button');
        courseStatus.innerHTML = `
            <div class="course-info">
                <div class="course-price">
                    <span class="old-price">₹1999</span>
                    <span class="offer-price">₹9 Only</span>
                </div>
                <p class="launch-offer-text">🔥 Launch Offer - Limited Time!</p>
                <a href="cart.html" class="btn-buy-course">Buy Course</a>
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
    console.log('Dashboard: Initializing dashboard...');
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
        
        console.log('Dashboard: Initialization completed successfully');
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        
        // Hide loading state
        hideLoading();
        
        // Show error message
        showError(error.message || 'Failed to load dashboard. Please try again.');
    }
}

// ==================== EVENT LISTENERS ====================

// ==================== LOGOUT FUNCTION ====================

// Reusable logout function
function logoutUser() {
    // Clear all auth data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Show logout success modal
    showSuccessModal('Logged Out Successfully 👋', 'Redirecting to homepage...', 'index.html#home', 1500);
}

// Logout button
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Call the reusable logout function
            logoutUser();
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
