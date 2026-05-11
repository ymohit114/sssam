// ==================== CART PAGE JAVASCRIPT ====================

// API Base URL
const API_BASE_URL = 'http://localhost:5000';

// Razorpay Test Key ID
const RAZORPAY_KEY_ID = 'rzp_test_SnywV7mrRhXqMh';

// ==================== SUCCESS MODAL FUNCTIONS ====================

// Show success modal with custom title and message
function showSuccessModal(title, message, redirectUrl, delay = 2000) {
    const successModal = document.getElementById('successModal');
    const successModalTitle = document.getElementById('successModalTitle');
    const successModalMessage = document.getElementById('successModalMessage');
    const loaderBar = document.querySelector('.loader-bar');
    
    if (!successModal) return;
    
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
    
    if (!successModal) return;
    
    // Set error title and message
    if (title) successModalTitle.textContent = title;
    if (message) successModalMessage.textContent = message;
    
    // Change icon to error (red)
    if (successIcon) {
        successIcon.style.color = '#ef4444';
        successIcon.style.borderColor = '#ef4444';
        successIcon.style.background = 'rgba(239, 68, 68, 0.1)';
        successIcon.innerHTML = `
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
    }
    
    // Hide loader
    if (loaderBar) {
        loaderBar.style.display = 'none';
    }
    
    // Show modal
    successModal.classList.add('active');
    
    // Auto close after 3 seconds
    setTimeout(() => {
        successModal.classList.remove('active');
        
        // Reset to success state
        setTimeout(() => {
            if (successIcon) {
                successIcon.style.color = '#22c55e';
                successIcon.style.borderColor = '#22c55e';
                successIcon.style.background = 'rgba(34, 197, 94, 0.1)';
                successIcon.innerHTML = `
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                `;
            }
            if (loaderBar) {
                loaderBar.style.display = 'block';
            }
        }, 300);
    }, 3000);
}

// ==================== AUTHENTICATION ====================

// Check if user is authenticated
function checkAuth() {
    console.log('Cart: Checking authentication...');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        console.log('Cart: Authentication failed - redirecting to login');
        window.location.href = 'index.html';
        return false;
    }
    
    console.log('Cart: Authentication successful');
    return { token, user: JSON.parse(user) };
}

// ==================== API HELPER ====================

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
        console.log(`Cart API Request: ${options.method || 'GET'} ${API_BASE_URL}${url}`);
        const response = await fetch(`${API_BASE_URL}${url}`, requestOptions);
        const data = await response.json();
        
        console.log('Cart API Response:', data);
        
        // Handle 401 Unauthorized
        if (response.status === 401) {
            console.error('Cart: Unauthorized - clearing token');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
            throw new Error('Session expired. Please login again.');
        }
        
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('Cart API Error:', error);
        throw error;
    }
}

// ==================== RAZORPAY INTEGRATION ====================

// Initialize Razorpay with order data
function initRazorpay(orderData) {
    console.log('Cart: Initializing Razorpay with order data:', orderData);
    
    // Verify Razorpay is loaded
    if (typeof Razorpay === 'undefined') {
        console.error('Cart: Razorpay is not defined');
        throw new Error('Razorpay failed to load. Please refresh the page and try again.');
    }
    
    console.log('Cart: Window Razorpay:', window.Razorpay);
    
    const user = JSON.parse(localStorage.getItem('user'));
    
    const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'SSSAM Academy',
        description: 'AI Powered Full Stack Web Development Training',
        order_id: orderData.order.id,
        image: '', // Add logo URL if available
        handler: async function (response) {
            console.log('Cart: Razorpay payment success:', response);
            // Payment successful - verify with backend
            await verifyPayment(response);
        },
        prefill: {
            name: user.name || '',
            email: user.email || '',
            contact: ''
        },
        notes: {
            userId: user._id || ''
        },
        theme: {
            color: '#7c3aed',
            backdrop_color: '#0b0f19'
        },
        modal: {
            ondismiss: function() {
                console.log('Cart: Razorpay modal dismissed by user');
                // Reset button state - user cancelled, not an error
                resetButtonState();
            }
        }
    };
    
    console.log('Cart: Razorpay options:', options);
    
    try {
        console.log('Cart: Creating Razorpay instance...');
        const rzp = new Razorpay(options);
        console.log('Cart: Razorpay instance created successfully');
        
        console.log('Cart: Opening Razorpay popup...');
        rzp.open();
        console.log('Cart: Razorpay popup opened');
        
        // Handle Razorpay errors
        rzp.on('payment.failed', function (response) {
            console.error('Cart: Razorpay payment failed:', response);
            showErrorModal('Payment Failed', response.error.description || 'Payment failed. Please try again.');
            resetButtonState();
        });
    } catch (error) {
        console.error('Cart: Razorpay initialization error:', error);
        throw new Error('Failed to initialize payment gateway. Please try again.');
    }
}

// Verify payment with backend
async function verifyPayment(paymentResponse) {
    console.log('Cart: Verifying payment with backend...');
    
    try {
        const response = await apiRequest('/api/payment/verify-payment', {
            method: 'POST',
            body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
            }),
        });
        
        console.log('Cart: Payment verification response:', response);
        
        if (response.success) {
            console.log('Cart: Payment verified successfully');
            // Payment verified successfully
            showSuccessModal('Payment Successful! 🎉', 'Redirecting to success page...', 'success.html');
        } else {
            throw new Error('Payment verification failed');
        }
    } catch (error) {
        console.error('Cart: Payment verification error:', error);
        showErrorModal('Payment Verification Failed', error.message || 'Unable to verify payment. Please try again.');
        resetButtonState();
    }
}

// Create order with backend
async function createOrder() {
    console.log('Cart: Creating Razorpay order with backend...');
    
    try {
        const response = await apiRequest('/api/payment/create-order', {
            method: 'POST',
            body: JSON.stringify({
                amount: 900, // ₹9 in paise
                currency: 'INR',
            }),
        });
        
        console.log('Cart: Order created response:', response);
        
        // Handle different response formats
        let orderData;
        if (response.success && response.data && response.data.order) {
            // Format: { success: true, data: { order: {...} } }
            orderData = response.data;
        } else if (response.success && response.order) {
            // Format: { success: true, order: {...} }
            orderData = response;
        } else {
            throw new Error(response.message || 'Invalid order response format');
        }
        
        console.log('Cart: Order data extracted:', orderData);
        console.log('Cart: Order created successfully, initializing Razorpay');
        
        return {
            order: orderData.order,
            key: RAZORPAY_KEY_ID
        };
    } catch (error) {
        console.error('Cart: Order creation error:', error);
        throw error;
    }
}

// Reset button state
function resetButtonState() {
    const btn = document.getElementById('proceedBtn');
    if (!btn) return;
    
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    const btnIcon = btn.querySelector('.btn-icon');
    
    if (btnText) btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
    if (btnIcon) btnIcon.style.display = 'inline';
    btn.disabled = false;
}

// Show loading state
function showLoadingState() {
    const btn = document.getElementById('proceedBtn');
    if (!btn) return;
    
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    const btnIcon = btn.querySelector('.btn-icon');
    
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline';
    if (btnIcon) btnIcon.style.display = 'none';
    btn.disabled = true;
}

// ==================== PROCEED BUTTON HANDLER ====================

// Proceed to payment button handler
function initProceedButton() {
    const proceedBtn = document.getElementById('proceedBtn');
    
    if (!proceedBtn) {
        console.error('Cart: Proceed button not found');
        return;
    }
    
    console.log('Cart: Proceed button found, attaching event listener');
    
    proceedBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        console.log('Cart: Proceed to payment clicked');
        
        // Check if Razorpay is loaded
        if (typeof Razorpay === 'undefined') {
            console.error('Cart: Razorpay not loaded');
            showErrorModal('Payment Error', 'Razorpay failed to load. Please refresh the page and try again.');
            return;
        }
        
        try {
            // Show loading state
            showLoadingState();
            
            // Check authentication
            const auth = checkAuth();
            if (!auth) {
                console.error('Cart: Authentication failed');
                showErrorModal('Authentication Required', 'Please login to continue with payment.');
                resetButtonState();
                return;
            }
            
            console.log('Cart: Token:', auth.token.substring(0, 10) + '...');
            
            // Create order with backend
            console.log('Cart: Creating order...');
            const orderData = await createOrder();
            console.log('Cart: Order data received:', orderData);
            
            // Initialize Razorpay payment
            console.log('Cart: Initializing Razorpay...');
            initRazorpay(orderData);
            
        } catch (error) {
            console.error('Cart: Payment flow error:', error);
            showErrorModal('Payment Failed', error.message || 'Unable to create order. Please try again.');
            resetButtonState();
        }
    });
}

// ==================== INITIALIZATION ====================

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart: Page loaded');
    
    // Check authentication
    const auth = checkAuth();
    if (!auth) return;
    
    // Initialize proceed button
    initProceedButton();
    
    console.log('Cart: Initialization completed successfully');
    console.log('Cart: Razorpay loaded:', typeof Razorpay !== 'undefined');
});
