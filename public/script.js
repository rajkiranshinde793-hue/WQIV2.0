document.addEventListener("DOMContentLoaded", () => {
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