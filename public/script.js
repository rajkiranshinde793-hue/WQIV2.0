document.addEventListener("DOMContentLoaded", () => {
    // ============================================
    // AUTO-ACTIVE NAVBAR LINK
    // ============================================
    (function() {
        // Get current pathname (e.g., "/public/dashboard.html")
        const currentPath = window.location.pathname;
        
        // Get filename from path (e.g., "dashboard.html")
        const currentPage = currentPath.split('/').pop() || 'index.html';
        
        // Select all nav links
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            // Get the href attribute (e.g., "dashboard.html")
            const linkHref = link.getAttribute('href');
            
            // Remove active class from all links
            link.classList.remove('active');
            
            // Add active class if href matches current page
            if (linkHref === currentPage) {
                link.classList.add('active');
            }
        });
    })();

    // ============================================
    // HAMBURGER MENU FUNCTIONALITY
    // ============================================
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    if (hamburger && navLinks) {
        // 1. Toggle menu when clicking the hamburger
        hamburger.addEventListener("click", (e) => {
            // This stops the click from instantly triggering the document click listener below
            e.stopPropagation(); 
            
            hamburger.classList.toggle("active");
            navLinks.classList.toggle("active");
        });

        // 2. Close menu when clicking ANYWHERE outside of it
        document.addEventListener("click", (e) => {
            // If the menu is currently active AND you didn't click inside the nav-links box...
            if (navLinks.classList.contains("active") && !navLinks.contains(e.target)) {
                hamburger.classList.remove("active");
                navLinks.classList.remove("active");
            }
        });

        // 3. (Optional but good) Close the menu if they actually click a link inside it
        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                hamburger.classList.remove("active");
                navLinks.classList.remove("active");
            });
        });
    }
    
});
