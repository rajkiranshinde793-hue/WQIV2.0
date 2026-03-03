// Authentication helper for all pages
// This file provides auth state tracking but does NOT block page access

document.addEventListener("DOMContentLoaded", () => {
    // Update UI based on auth state
    updateNavbarForAuth();
    updateHeroButton();
});

// Check if user is logged in (for use by other scripts)
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Get user email (for use by other scripts)
function getUserEmail() {
    return localStorage.getItem('userEmail');
}

// Update navbar based on login state
function updateNavbarForAuth() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    
    const isLoggedInVal = isLoggedIn();
    
    // Check if login/logout item already exists
    let authItem = navLinks.querySelector('.auth-item');
    
    if (isLoggedInVal) {
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
    
    const isLoggedInVal = isLoggedIn();
    
    if (isLoggedInVal) {
        // Hide the hero login button when logged in
        heroLoginBtn.style.display = 'none';
    } else {
        // Show login button when not logged in
        heroLoginBtn.style.display = 'inline-block';
        heroLoginBtn.textContent = 'LOGIN';
        heroLoginBtn.href = 'login.html';
    }
}

// Handle logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
}

// Export functions for use in other scripts
window.authHelper = {
    isLoggedIn: isLoggedIn,
    getUserEmail: getUserEmail,
    logout: logout,
    updateNavbarForAuth: updateNavbarForAuth,
    updateHeroButton: updateHeroButton
};

