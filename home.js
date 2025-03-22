// Wait for the DOM to load before running the script
document.addEventListener('DOMContentLoaded', () => {
    // Select the theme toggle button and body
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check if the theme toggle button exists
    if (!themeToggle) {
        console.error('Theme toggle button not found!');
        return;
    }

    // Select the theme icon inside the button
    const themeIcon = themeToggle.querySelector('img');

    // Check if the theme icon exists
    if (!themeIcon) {
        console.error('Theme icon not found!');
        return;
    }

    // Function to set the theme
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeIcon.src = 'sun-icon.png'; // Set sun icon for dark mode
        } else {
            body.classList.remove('dark-mode');
            themeIcon.src = 'moon-icon.png'; // Set moon icon for light mode
        }
    }

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // Toggle dark mode on button click
    themeToggle.addEventListener('click', () => {
        const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme); // Save the new theme to localStorage
    });
});