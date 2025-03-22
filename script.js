// Select elements
const video = document.getElementById('video');
const captureBtn = document.getElementById('captureBtn'); // Combined button
const retryBtn = document.getElementById('retryBtn');
const countdownEl = document.getElementById('countdown');
const photoCountEl = document.getElementById('photoCount');
const photos = []; // Store individual photos
let currentPhotoIndex = 0; // Track the current photo being taken
let countdownDuration = 5; // Default countdown duration

// Frame guide elements
const frameGuideCanvas = document.getElementById('frameGuide');
const frameGuideCtx = frameGuideCanvas.getContext('2d');
const toggleFrameGuideBtn = document.getElementById('toggleFrameGuide');
const frameGuideIcon = document.getElementById('frameGuideIcon');

// Timer toggle elements
const timerToggleBtn = document.getElementById('timerToggleBtn');
const timerIcon = document.getElementById('timerIcon');

// Ensure the retry button stays hidden initially
if (retryBtn) {
    retryBtn.style.display = 'none';
    retryBtn.style.opacity = '0';
}

// Initialize webcam
function initializeWebcam() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support accessing the webcam. Please use a modern browser like Chrome or Firefox.');
        return;
    }

    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
        })
        .catch((error) => {
            console.error('Error accessing webcam:', error);
            alert('Unable to access the webcam. Please check your camera settings.');
        });
}

// Start countdown
function startCountdown(callback) {
    if (!countdownEl) {
        console.error('Countdown element not found in the DOM!');
        return;
    }

    countdownEl.style.display = 'block';
    let timeLeft = countdownDuration;
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
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.translate(video.videoWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
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

// Start capture sequence
function startCaptureSequence() {
    if (!video.srcObject) {
        alert('Please start the camera first.');
        return;
    }

    if (!captureBtn) {
        console.error('Capture button not found in the DOM!');
        return;
    }

    captureBtn.disabled = true;
    captureBtn.textContent = 'Capturing...';

    function takeNextPhoto(count) {
        if (count > 4) {
            // All photos are taken
            captureBtn.textContent = 'Next';
            captureBtn.disabled = false;

            // Show retry button
            if (retryBtn) {
                retryBtn.style.display = 'flex';
                retryBtn.style.opacity = '1';
            }

            return;
        }

        startCountdown(() => {
            const photoData = capturePhoto();
            photos.push(photoData);
            const photoElement = document.getElementById(`photo${count}`);
            if (photoElement) {
                photoElement.src = photoData;
                photoElement.style.visibility = 'visible';
            }
            if (photoCountEl) {
                photoCountEl.textContent = `${count}/4`;
            }

            provideFeedback(); // Provide visual feedback after each photo
            takeNextPhoto(count + 1); // Take the next photo
        });
    }

    takeNextPhoto(1); // Start taking photos
}

// Combined button functionality
if (captureBtn) {
    captureBtn.addEventListener('click', () => {
        if (captureBtn.textContent === 'Start Capture') {
            // Start capturing photos
            startCaptureSequence();
        } else if (captureBtn.textContent === 'Next') {
            // Redirect to customization page
            window.location.href = 'customization.html';
        }
    });
}

// Retry functionality
if (retryBtn) {
    retryBtn.addEventListener('click', () => {
        const confirmRetry = confirm('Are you sure you want to retake all photos? This will reset the current photos.');
        if (confirmRetry) {
            // Reset all photos
            photos.length = 0;
            currentPhotoIndex = 0;
            for (let i = 1; i <= 4; i++) {
                const photoElement = document.getElementById(`photo${i}`);
                if (photoElement) {
                    photoElement.style.visibility = 'hidden';
                }
            }
            if (photoCountEl) {
                photoCountEl.textContent = '0/4';
            }

            // Hide retry button
            retryBtn.style.display = 'none';
            retryBtn.style.opacity = '0';

            // Reset capture button
            captureBtn.textContent = 'Start Capture';
            captureBtn.disabled = false;
        }
    });
}

// Draw frame guide
function drawFrameGuide() {
    const width = video.videoWidth;
    const height = video.videoHeight;

    // Set canvas dimensions to match the video
    frameGuideCanvas.width = width;
    frameGuideCanvas.height = height;

    // Clear the canvas before redrawing
    frameGuideCtx.clearRect(0, 0, width, height);

    // Draw a small crosshair in the middle
    frameGuideCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; // White lines with transparency
    frameGuideCtx.lineWidth = 1; // Thin lines for the crosshair

    // Crosshair size (smaller)
    const crosshairSize = 20; // Adjust this to make the crosshair smaller or larger

    // Vertical line (middle)
    frameGuideCtx.beginPath();
    frameGuideCtx.moveTo(width / 2, height / 2 - crosshairSize); // Top of the crosshair
    frameGuideCtx.lineTo(width / 2, height / 2 + crosshairSize); // Bottom of the crosshair
    frameGuideCtx.stroke();

    // Horizontal line (middle)
    frameGuideCtx.beginPath();
    frameGuideCtx.moveTo(width / 2 - crosshairSize, height / 2); // Left of the crosshair
    frameGuideCtx.lineTo(width / 2 + crosshairSize, height / 2); // Right of the crosshair
    frameGuideCtx.stroke();

    // Draw thicker rule of thirds lines
    frameGuideCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; // White lines with transparency
    frameGuideCtx.lineWidth = 2; // Thicker lines

    // Adjust the rule of thirds grid to make the middle section wider
    const middleSectionWidth = width * 0.8; // Middle section takes 50% of the width
    const sideSectionWidth = (width - middleSectionWidth) / 2; // Each side section takes 25% of the width

    // Draw the first and fourth vertical lines (thicker and different color)
    frameGuideCtx.strokeStyle = 'rgba(255, 0, 0, 0.7)'; // Red color for the outer lines
    frameGuideCtx.lineWidth = 4; // Thicker lines

    // First vertical line (leftmost)
    frameGuideCtx.beginPath();
    frameGuideCtx.moveTo(sideSectionWidth, 0); // Left line (25% of the width)
    frameGuideCtx.lineTo(sideSectionWidth, height);
    frameGuideCtx.stroke();

    // Fourth vertical line (rightmost)
    frameGuideCtx.beginPath();
    frameGuideCtx.moveTo(width - sideSectionWidth, 0); // Right line (75% of the width)
    frameGuideCtx.lineTo(width - sideSectionWidth, height);
    frameGuideCtx.stroke();

    // Reset stroke style and line width for the middle lines
    frameGuideCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; // White lines with transparency
    frameGuideCtx.lineWidth = 2; // Thinner lines

    // Add two more vertical lines in the middle
    const middleLeft = sideSectionWidth + (middleSectionWidth * 0.23); // First middle line (37.5% of the width)
    const middleRight = sideSectionWidth + (middleSectionWidth * 0.73); // Second middle line (62.5% of the width)

    // Second vertical line (first middle line)
    frameGuideCtx.beginPath();
    frameGuideCtx.moveTo(middleLeft, 0); // First middle line
    frameGuideCtx.lineTo(middleLeft, height);
    frameGuideCtx.stroke();

    // Third vertical line (second middle line)
    frameGuideCtx.beginPath();
    frameGuideCtx.moveTo(middleRight, 0); // Second middle line
    frameGuideCtx.lineTo(middleRight, height);
    frameGuideCtx.stroke();

    // Horizontal lines (1/3 and 2/3 of the height)
    frameGuideCtx.beginPath();
    frameGuideCtx.moveTo(0, height / 3); // Top horizontal line
    frameGuideCtx.lineTo(width, height / 3);
    frameGuideCtx.moveTo(0, (2 * height) / 3); // Bottom horizontal line
    frameGuideCtx.lineTo(width, (2 * height) / 3);
    frameGuideCtx.stroke();

    // Draw larger L-shapes at the corners
    const cornerSize = 40; // Increased size of the L-shapes
    frameGuideCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)';

    // Top-left corner
    frameGuideCtx.beginPath();
    frameGuideCtx.moveTo(0, cornerSize);
    frameGuideCtx.lineTo(0, 0);
    frameGuideCtx.lineTo(cornerSize, 0);
    frameGuideCtx.stroke();

    // Top-right corner
    frameGuideCtx.beginPath();
    frameGuideCtx.moveTo(width - cornerSize, 0);
    frameGuideCtx.lineTo(width, 0);
    frameGuideCtx.lineTo(width, cornerSize);
    frameGuideCtx.stroke();

    // Bottom-left corner
    frameGuideCtx.beginPath();
    frameGuideCtx.moveTo(0, height - cornerSize);
    frameGuideCtx.lineTo(0, height);
    frameGuideCtx.lineTo(cornerSize, height);
    frameGuideCtx.stroke();

    // Bottom-right corner
    frameGuideCtx.beginPath();
    frameGuideCtx.moveTo(width - cornerSize, height);
    frameGuideCtx.lineTo(width, height);
    frameGuideCtx.lineTo(width, height - cornerSize);
    frameGuideCtx.stroke();
}

// Toggle frame guide visibility and update icon
function toggleFrameGuide() {
    const frameGuideVisible = frameGuideCanvas.style.display === 'block';
    frameGuideCanvas.style.display = frameGuideVisible ? 'none' : 'block';
    
    // Update the icon to indicate the frame guide state
    if (frameGuideVisible) {
        frameGuideIcon.style.opacity = '0.5'; // Dim the icon when frame guide is off
    } else {
        frameGuideIcon.style.opacity = '1'; // Brighten the icon when frame guide is on
    }

    if (!frameGuideVisible) {
        drawFrameGuide(); // Redraw the frame guide when shown
    }
}

// Add event listener to the toggle button
if (toggleFrameGuideBtn) {
    toggleFrameGuideBtn.addEventListener('click', toggleFrameGuide);
}

// Redraw the frame guide when the video resizes
video.addEventListener('resize', () => {
    if (frameGuideCanvas.style.display === 'block') {
        drawFrameGuide();
    }
});

// Timer toggle functionality
if (timerToggleBtn && timerIcon) {
    timerToggleBtn.addEventListener('click', () => {
        if (countdownDuration === 5) {
            // Switch to 10 seconds
            countdownDuration = 10;
            timerIcon.src = "10-seconds-icon.png"; // Change to 10-second icon
            timerIcon.alt = "10 Seconds";
        } else {
            // Switch to 5 seconds
            countdownDuration = 5;
            timerIcon.src = "5-seconds-icon.png"; // Change to 5-second icon
            timerIcon.alt = "5 Seconds";
        }
    });
}

// Initialize webcam on page load
initializeWebcam();