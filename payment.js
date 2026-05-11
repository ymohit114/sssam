// ==================== PAYMENT PAGE JAVASCRIPT ====================

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

// ==================== AUTHENTICATION ====================

// Check if user is authenticated
function checkAuth() {
    console.log('Checking authentication...');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        console.log('Authentication failed - redirecting to login');
        window.location.href = 'index.html';
        return false;
    }
    
    console.log('Authentication successful');
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
        console.log(`API Request: ${options.method || 'GET'} ${API_BASE_URL}${url}`);
        const response = await fetch(`${API_BASE_URL}${url}`, requestOptions);
        const data = await response.json();
        
        console.log('API Response:', data);
        
        // Handle 401 Unauthorized
        if (response.status === 401) {
            console.error('Unauthorized - clearing token');
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
        console.error('API Error:', error);
        throw error;
    }
}

// ==================== RAZORPAY INTEGRATION ====================

// Initialize Razorpay with order data
function initRazorpay(orderData) {
    console.log('Initializing Razorpay with order data:', orderData);
    
    const user = JSON.parse(localStorage.getItem('user'));
    const phone = document.getElementById('phone').value;
    
    const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'SSSAM Academy',
        description: 'AI Powered Full Stack Web Development Training',
        order_id: orderData.order.id,
        image: '', // Add logo URL if available
        handler: async function (response) {
            console.log('Razorpay payment success:', response);
            // Payment successful - verify with backend
            await verifyPayment(response);
        },
        prefill: {
            name: user.name || '',
            email: user.email || '',
            contact: phone || ''
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
                console.log('Razorpay modal dismissed');
                // Reset button state
                const btn = document.querySelector('.btn-pay');
                btn.textContent = 'Pay ₹9';
                btn.disabled = false;
            }
        }
    };
    
    console.log('Opening Razorpay checkout...');
    const rzp = new Razorpay(options);
    rzp.open();
    
    // Handle Razorpay errors
    rzp.on('payment.failed', function (response) {
        console.error('Razorpay payment failed:', response);
        showErrorModal('Payment Failed', response.error.description || 'Payment failed. Please try again.');
        
        // Reset button state
        const btn = document.querySelector('.btn-pay');
        btn.textContent = 'Pay ₹9';
        btn.disabled = false;
    });
}

// Verify payment with backend
async function verifyPayment(paymentResponse) {
    console.log('Verifying payment with backend...');
    
    try {
        const response = await apiRequest('/api/payment/verify-payment', {
            method: 'POST',
            body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
            }),
        });
        
        console.log('Payment verification response:', response);
        
        if (response.success) {
            console.log('Payment verified successfully');
            // Payment verified successfully
            showSuccessModal('Payment Successful! 🎉', 'Redirecting to success page...', 'success.html');
        } else {
            throw new Error('Payment verification failed');
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        showErrorModal('Payment Verification Failed', error.message || 'Unable to verify payment. Please try again.');
        
        // Reset button state
        const btn = document.querySelector('.btn-pay');
        btn.textContent = 'Pay ₹9';
        btn.disabled = false;
    }
}

// Create order with backend
async function createOrder() {
    console.log('Creating Razorpay order with backend...');
    
    try {
        const response = await apiRequest('/api/payment/create-order', {
            method: 'POST',
            body: JSON.stringify({
                amount: 900, // ₹9 in paise
                currency: 'INR',
            }),
        });
        
        console.log('Order created response:', response);
        
        if (response.success && response.order) {
            console.log('Order created successfully, initializing Razorpay');
            return {
                order: response.order,
                key: RAZORPAY_KEY_ID
            };
        } else {
            throw new Error(response.message || 'Failed to create order');
        }
    } catch (error) {
        console.error('Order creation error:', error);
        throw error;
    }
}

// ==================== PAYMENT FORM HANDLER ====================

// Payment form submission handler
document.getElementById('paymentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('Payment form submitted');
    
    const btn = document.querySelector('.btn-pay');
    const originalText = btn.textContent;
    
    // Validate form
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    
    if (!fullName || !email || !phone) {
        showErrorModal('Validation Error', 'Please fill in all required fields.');
        return;
    }
    
    // Show loading state
    btn.textContent = 'Creating order...';
    btn.disabled = true;
    
    try {
        // Create order with backend
        const orderData = await createOrder();
        
        // Initialize Razorpay payment
        btn.textContent = 'Opening payment...';
        initRazorpay(orderData);
        
    } catch (error) {
        console.error('Payment flow error:', error);
        showErrorModal('Payment Failed', error.message || 'Unable to create order. Please try again.');
        btn.textContent = originalText;
        btn.disabled = false;
    }
});

// ==================== UI ENHANCEMENTS ====================

// Payment method selection
document.querySelectorAll('.payment-method input').forEach(input => {
    input.addEventListener('change', function() {
        document.querySelectorAll('.payment-method').forEach(opt => {
            opt.classList.remove('active');
        });
        this.closest('.payment-method').classList.add('active');
    });
});

// ==================== INITIALIZATION ====================

// Check authentication and populate user data on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Payment page loaded');
    
    // Check authentication
    const auth = checkAuth();
    if (!auth) return;
    
    // Populate form with user data if available
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            console.log('Populating form with user data');
            document.getElementById('fullName').value = user.name || '';
            document.getElementById('email').value = user.email || '';
        }
    } catch (error) {
        console.error('Error populating user data:', error);
    }
});
