// Select elements
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle?.querySelector('img');
const body = document.body;
const video = document.getElementById('video');
const captureBtn = document.getElementById('captureBtn');
const downloadBtn = document.getElementById('downloadBtn');
const countdownEl = document.getElementById('countdown');
const photoCountEl = document.getElementById('photoCount');
const photos = []; // Store individual photos

// Ensure the download button stays hidden initially
if (downloadBtn) {
    downloadBtn.style.visibility = 'hidden';
    downloadBtn.style.opacity = '0';
}

// Function to handle theme toggling
function toggleTheme() {
    const currentTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
}

// Function to apply the theme
function applyTheme(theme) {
    if (theme === 'dark') {
        body.classList.add('dark-mode');
        themeIcon.src = 'sun-icon.png';
    } else {
        body.classList.remove('dark-mode');
        themeIcon.src = 'moon-icon.png';
    }
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// Initialize webcam
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

// Start countdown
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

// Capture photo
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

// Provide visual feedback
function provideFeedback() {
    const feedback = document.createElement('div');
    feedback.style.position = 'absolute';
    feedback.style.top = '0';
    feedback.style.left = '0';
    feedback.style.width = '100%';
    feedback.style.height = '100%';
    feedback.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    feedback.style.pointerEvents = 'none';

    const videoContainer = document.querySelector('.video-container');
    videoContainer.appendChild(feedback);

    setTimeout(() => {
        videoContainer.removeChild(feedback);
    }, 100);
}

// Capture sequence
function startCaptureSequence() {
    captureBtn.textContent = 'Capturing...';
    captureBtn.disabled = true;

    photos.length = 0;
    photoCountEl.textContent = '0/4';

    function takeNextPhoto(count) {
        if (count > 4) {
            localStorage.setItem('capturedPhotos', JSON.stringify(photos));
            console.log("Photos saved to localStorage:", photos);
            captureBtn.textContent = 'Start Capture';
            captureBtn.disabled = false;
            downloadBtn.textContent = 'Next'; // Change button text to "Next"
            downloadBtn.classList.add('show');
            downloadBtn.style.visibility = 'visible'; // Ensure it's visible
            downloadBtn.style.opacity = '1'; // Make sure it’s fully visible
            return;
        }
        startCountdown(5, () => {
            const photoData = capturePhoto();
            photos.push(photoData);
            document.getElementById(`photo${count}`).src = photoData;
            document.getElementById(`photo${count}`).style.visibility = 'visible';
            photoCountEl.textContent = `${count}/4`;
            provideFeedback();
            takeNextPhoto(count + 1);
        });
    }
    takeNextPhoto(1);
}

// Initialize webcam and add event listeners
if (video) {
    initializeWebcam();
    captureBtn.addEventListener('click', startCaptureSequence);
    downloadBtn.addEventListener('click', () => {
        window.location.href = 'customization.html'; // Redirect to customization page
    });
}
