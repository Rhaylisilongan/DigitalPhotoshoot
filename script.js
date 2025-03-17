// Select elements
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('img');
const body = document.body;
const video = document.getElementById('video');
const captureBtn = document.getElementById('captureBtn');
const downloadBtn = document.getElementById('downloadBtn');
const countdownEl = document.getElementById('countdown');
const photoCountEl = document.getElementById('photoCount');
const canvas = document.getElementById('canvas');
const ctx = canvas?.getContext('2d');
const photos = [];
const collageData = canvas.toDataURL('image/png');
     console.log('Collage data to save:', collageData); // Debug: Log the data URL
     localStorage.setItem('collage', collageData);

// Ensure the download button stays in place but remains hidden
if (downloadBtn) {
    downloadBtn.style.visibility = 'hidden'; // Keep space reserved, just hide it
}

// Function to handle theme toggling
function toggleTheme() {
    const currentTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(currentTheme);
    localStorage.setItem('theme', currentTheme); // Save the theme to localStorage
}

// Function to apply the theme
function applyTheme(theme) {
    const themeIcon = document.querySelector('.theme-icon'); // Target the icon by class
    if (theme === 'dark') {
        body.classList.add('dark-mode');
        themeIcon.src = 'sun-icon.png'; // Change icon to sun
    } else {
        body.classList.remove('dark-mode');
        themeIcon.src = 'moon-icon.png'; // Change icon to moon
    }
}

// Load theme from localStorage on page load
const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light theme
applyTheme(savedTheme);

// Toggle theme when the button is clicked
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// Function to handle webcam access
function initializeWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((error) => {
            alert('Unable to access the webcam. Please check your camera settings.');
            console.error('Error accessing webcam:', error);
        });
}

// Function to start the countdown
function startCountdown(seconds, callback) {
    countdownEl.style.display = 'block';
    let timeLeft = seconds;
    countdownEl.textContent = timeLeft;
    const timer = setInterval(() => {
        timeLeft--;
        countdownEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            countdownEl.style.display = 'none';
            callback();
        }
    }, 1000);
}

// Function to capture a photo
function capturePhoto() {
    // Trigger the flash effect
    const videoContainer = document.querySelector('video');
    videoContainer.classList.add('flash-effect'); // Add flash effect

    // Remove the flash effect after the animation completes
    setTimeout(() => {
        videoContainer.classList.remove('flash-effect');
    }, 300); // Match the duration of the CSS animation

    // Capture the photo
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.translate(video.videoWidth, 0);
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    return tempCanvas.toDataURL('image/png');
}

// Function to provide visual feedback over the webcam preview
function provideFeedback() {
    const feedback = document.createElement('div');
    feedback.style.position = 'absolute';
    feedback.style.top = '0';
    feedback.style.left = '0';
    feedback.style.width = '100%';
    feedback.style.height = '100%';
    feedback.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    feedback.style.borderRadius = '10px';
    feedback.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.8)';
    feedback.style.pointerEvents = 'none'; // Ensure it doesn't interfere with interactions

    // Append the feedback to the video container
    const videoContainer = document.querySelector('.video-container');
    videoContainer.appendChild(feedback);

    // Remove the feedback after a short duration
    setTimeout(() => {
        videoContainer.removeChild(feedback);
    }, 100);
}

// Function to start the capture sequence
function startCaptureSequence() {
    captureBtn.textContent = 'Capturing...'; // Change button text to "Capturing..."
    captureBtn.disabled = true; // Disable the button during capture

    photos.length = 0;
    photoCountEl.textContent = '0/3';

    function takeNextPhoto(count) {
        if (count > 3) {
            createCollage();
            captureBtn.textContent = 'Start Capture'; // Revert button text
            captureBtn.disabled = false; // Re-enable the button
            return;
        }
        startCountdown(5, () => {
            const photoData = capturePhoto();
            photos.push(photoData);
            document.getElementById(`photo${count}`).src = photoData;
            document.getElementById(`photo${count}`).style.visibility = 'visible';
            photoCountEl.textContent = `${count}/3`;
            provideFeedback(); // Provide visual feedback
            takeNextPhoto(count + 1);
        });
    }
    takeNextPhoto(1);
}

// Function to create a photo collage

function createCollage() {
    canvas.width = 800; // Set canvas width
    canvas.height = 1200; // Set canvas height
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the canvas with a white background

    const photoWidth = canvas.width - 40; // Width of each photo in the collage
    const photoHeight = (canvas.height - 80) / 3; // Height of each photo in the collage

    photos.forEach((photo, index) => {
        const img = new Image();
        img.src = photo;
        img.onload = () => {
            const yPosition = 20 + index * (photoHeight + 20); // Calculate the Y position for each photo
            ctx.fillStyle = 'white';
            ctx.fillRect(10, yPosition - 10, photoWidth + 20, photoHeight + 20); // Add a white border around the photo
            ctx.drawImage(img, 20, yPosition, photoWidth, photoHeight); // Draw the photo on the canvas
        };
    });

    // Save the collage to localStorage
    const collageData = canvas.toDataURL('image/png');
    console.log('Collage data to save:', collageData);
    localStorage.setItem('collage', collageData); // Save the collage to localStorage

    downloadBtn.textContent = 'Next'; // Change button text to "Next"
    downloadBtn.classList.add('show');
    downloadBtn.style.visibility = 'visible'; // Make it visible
    downloadBtn.style.opacity = '1';
}

// Initialize webcam and add event listeners
if (video) {
    initializeWebcam();
    captureBtn.addEventListener('click', startCaptureSequence);
    downloadBtn.addEventListener('click', () => {
        window.location.href = 'customization.html'; // Redirect to customization.html
    });
}