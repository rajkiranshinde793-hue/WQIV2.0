// Authentication helper for protected pages
// This file should be included in all pages

document.addEventListener("DOMContentLoaded", () => {
    // Check if user is logged in via Firebase or localStorage
    checkAuthState();
    
    // Update UI based on auth state
    updateNavbarForAuth();
    updateHeroButton();
});

// Function to check authentication state
async function checkAuthState() {
    // Wait for Firebase to initialize if it's being loaded
    await new Promise(resolve => {
        setTimeout(resolve, 500); // Give time for Firebase to load
    });
    
    // Get current page
    const currentPage = window.location.pathname;
    
    // Pages that require login (except login page itself)
    const protectedPages = [
        'dashboard.html',
        'calibrations.html',
        'alerts.html',
        'ai.html'
    ];
    
    // Check if current page is protected
    const isProtectedPage = protectedPages.some(page => currentPage.includes(page));
    
    if (isProtectedPage) {
        // Check localStorage for login status (fallback)
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (!isLoggedIn) {
            // Not logged in, redirect to login
            window.location.href = '../login.html?redirect=' + encodeURIComponent(window.location.href);
        }
    }
}

// Update navbar based on login state
function updateNavbarForAuth() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // Check if login/logout item already exists
    let authItem = navLinks.querySelector('.auth-item');
    
    if (isLoggedIn) {
        // User is logged in - show logout only
        if (!authItem) {
            authItem = document.createElement('li');
            authItem.className = 'auth-item';
            navLinks.appendChild(authItem);
        }
        authItem.innerHTML = '<a href="login.html?action=logout" class="logout-link">Logout</a>';
        
        // Remove the static login-item if it exists
        const loginItem = navLinks.querySelector('.login-item');
        if (loginItem) {
            loginItem.remove();
        }
    } else {
        // User is not logged in - show login only
        if (authItem) {
            authItem.remove();
        }
        
        // Ensure static login-item is present
        let staticLoginItem = navLinks.querySelector('.login-item');
        if (!staticLoginItem) {
            staticLoginItem = document.createElement('li');
            staticLoginItem.className = 'login-item';
            navLinks.appendChild(staticLoginItem);
        }
        staticLoginItem.innerHTML = '<a href="login.html" class="login-btn-nav">Login</a>';
    }
}

// Update hero button based on auth state - hide when logged in
function updateHeroButton() {
    const heroLoginBtn = document.getElementById('hero-login-btn');
    if (!heroLoginBtn) return;
    
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
        // Hide the hero login button when logged in
        heroLoginBtn.style.display = 'none';
    } else {
        // Show login button when not logged in
        heroLoginBtn.style.display = 'inline-block';
        heroLoginBtn.textContent = 'LOGIN';
        heroLoginBtn.href = 'login.html';
    }
}

// Handle protected link clicks
document.addEventListener('click', function(e) {
    // Check if clicked element is a protected link
    const protectedLink = e.target.closest('.protected-link');
    if (protectedLink) {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (!isLoggedIn) {
            e.preventDefault();
            const redirect = protectedLink.getAttribute('data-redirect') || protectedLink.getAttribute('href');
            window.location.href = 'login.html?redirect=' + encodeURIComponent(redirect);
        }
    }
});

// Export functions for use in other scripts
window.authHelper = {
    checkAuthState,
    updateNavbarForAuth,
    updateHeroButton,
    isLoggedIn: () => localStorage.getItem('isLoggedIn') === 'true',
    getUserEmail: () => localStorage.getItem('userEmail'),
    logout: () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        window.location.href = 'login.html';
    }
};
