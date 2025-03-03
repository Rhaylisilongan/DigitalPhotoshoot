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

// Ensure the download button stays in place but remains hidden
if (downloadBtn) {
    downloadBtn.style.visibility = 'hidden'; // Keep space reserved, just hide it
}

// Function to handle theme toggling
function toggleTheme() {
    const currentTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(currentTheme);
}

function applyTheme(theme) {
    if (theme === 'dark') {
        body.classList.add('dark-mode');
        themeIcon.src = 'sun-icon.png';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-mode');
        themeIcon.src = 'moon-icon.png';
        localStorage.setItem('theme', 'light');
    }
}

// Load theme from localStorage on page load
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

// Toggle dark mode when the button is clicked
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
    photos.length = 0;
    photoCountEl.textContent = '0/3';

    function takeNextPhoto(count) {
        if (count > 3) {
            createCollage();
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
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const photoWidth = canvas.width - 40;
    const extraBottomSpace = 80;
    const photoHeight = (canvas.height - extraBottomSpace - 80) / 3;

    photos.forEach((photo, index) => {
        const img = new Image();
        img.src = photo;
        img.onload = () => {
            const yPosition = 20 + index * (photoHeight + 20);
            ctx.fillStyle = 'white';
            ctx.fillRect(10, yPosition - 10, photoWidth + 20, photoHeight + 20);
            ctx.drawImage(img, 20, yPosition, photoWidth, photoHeight);
        };
    });
    downloadBtn.classList.add('show');
    downloadBtn.style.visibility = 'visible';  // Make it visible
    downloadBtn.style.opacity = '1'; 
}

// Initialize webcam and add event listeners
if (video) {
    initializeWebcam();
    captureBtn.addEventListener('click', startCaptureSequence);
    downloadBtn.addEventListener('click', () => {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = 'photobooth-collage.png';
        link.click();
    });
}
