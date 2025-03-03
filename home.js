function toggleTheme() {
    document.body.classList.toggle("dark-mode");

    // Get the icon element inside the button
    const themeIcon = document.querySelector(".theme-toggle-btn img");

    // Check if dark mode is active and switch the icon
    if (document.body.classList.contains("dark-mode")) {
        themeIcon.src = "sun-icon.png"; // Change to sun icon
    } else {
        themeIcon.src = "moon-icon.png"; // Change back to moon icon
    }
}
// Select the dark mode toggle button
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Function to set theme
function applyTheme(theme) {
    if (theme === 'dark') {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
}

// Load theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

// Toggle dark mode on button click
themeToggle.addEventListener('click', () => {
    const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
});