// Select elements
const video = document.getElementById('video');
const cameraSelect = document.getElementById('cameraSelect');
let cameras = []; // Store available cameras
const captureBtn = document.getElementById('captureBtn'); // Combined button
const retryBtn = document.getElementById('retryBtn');
const countdownEl = document.getElementById('countdown');
const photoCountEl = document.getElementById('photoCount');
const invertBtn = document.getElementById('invertBtn');
const photos = []; // Store individual photos
// Add to your existing variable declarations
let mediaRecorder;
let recordedChunks = [];
let sessionVideoBlob;
let photoVideos = [];
const videoDB = new VideoDB(); // Remove if using import
let currentPhotoIndex = 0; // Track the current photo being taken
let countdownDuration = 5; // Default countdown duration
let currentStream = null;

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


async function populateCameraDropdown() {
    try {
        // Request camera access first
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop()); // Stop the current stream
        }
        currentStream = stream;

        // Get all media devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log('Devices found:', devices); // Log all devices

        // Filter only video input devices (cameras)
        const cameras = devices.filter(device => device.kind === 'videoinput');
        console.log('Cameras found:', cameras); // Log cameras

        // Clear any existing options
        cameraSelect.innerHTML = '';

        // Add each camera as an option in the dropdown
        cameras.forEach((camera, index) => {
            const option = document.createElement('option');
            option.value = camera.deviceId;
            option.text = camera.label || `Camera ${index + 1}`; // Use a default label if no label is available
            cameraSelect.appendChild(option);
        });

        // If no cameras are found, display a message
        if (cameras.length === 0) {
            const option = document.createElement('option');
            option.text = 'No cameras found';
            cameraSelect.appendChild(option);
        }
    } catch (error) {
        console.error('Error accessing cameras:', error);
    }
}

// Function to start the camera
async function startCamera(deviceId) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true
    };
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        currentStream = stream;
    } catch (error) {
        console.error('Error starting camera:', error);
    }
}

// Event listener for camera selection change
cameraSelect.addEventListener('change', () => {
    const selectedCameraId = cameraSelect.value;
    startCamera(selectedCameraId);
});

// Populate the camera dropdown and start the default camera on page load
window.onload = async () => {
    await populateCameraDropdown();
    startCamera(cameraSelect.value); // Start the first camera by default
};

// Function to toggle camera inversion
function toggleInvertCamera() {
    const isInverted = video.style.transform === 'scaleX(-1)';
    video.style.transform = isInverted ? 'scaleX(1)' : 'scaleX(-1)'; // Toggle inversion
}

// Add event listener to the invert button
if (invertBtn) {
    invertBtn.addEventListener('click', toggleInvertCamera);
}
// Add a button to toggle inversion (optional)


// Populate the camera dropdown and start the default camera on page load
window.onload = async () => {
    await populateCameraDropdown();
    startCamera(cameraSelect.value); // Start the first camera by default
};
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
    
    // Trigger enhanced flash effect
    provideFeedback();
    
    return canvas.toDataURL('image/png');
}
// Enhanced flash effect function
function provideFeedback() {
    // Create flash overlay
    const flashOverlay = document.createElement('div');
    flashOverlay.className = 'flash-overlay';
    
    // Position it exactly over the video element
    const video = document.getElementById('video');
    const videoRect = video.getBoundingClientRect();
    
    flashOverlay.style.position = 'absolute';
    flashOverlay.style.top = `${videoRect.top}px`;
    flashOverlay.style.left = `${videoRect.left}px`;
    flashOverlay.style.width = `${videoRect.width}px`;
    flashOverlay.style.height = `${videoRect.height}px`;
    flashOverlay.style.zIndex = '1000';
    // In provideFeedback():
flashOverlay.style.boxShadow = '0 0 0 40px rgba(255,255,255,0.8)';
    
    document.body.appendChild(flashOverlay);
    
    // Trigger the flash animation
    setTimeout(() => {
        flashOverlay.classList.add('flash-active');
    }, 10);
    
    // Remove after animation completes
    setTimeout(() => {
        flashOverlay.remove();
    }, 500);
}

async function startCaptureSequence() {
    console.log("1️⃣ Starting capture sequence...");
    if (!video.srcObject) {
        console.error("❌ Camera not started!"); // Debug camera error
        alert('Please start the camera first.');
        return;
    }

    // Debug camera status
    console.log("📹 Camera stream active?", video.srcObject.getVideoTracks()[0].readyState);

    captureBtn.disabled = true;
    captureBtn.textContent = 'Capturing...';
    
     // Video recording debug
    console.log("⏺️ Starting session video recording...");
    // Start session video recording
    await startVideoRecording();
    console.log("✅ Session recording started");
    sessionVideoBlob = null;
    photoVideos = [];

    async function takeNextPhoto(count) {
        console.log(`📸 PHASE ${count}/4 started`); // Track photo number

        if (count > 4) {
            console.log("🏁 All photos completed - saving media...");

            // Save session video
            console.log("⏹️ Stopping session recording...");
            sessionVideoBlob = await stopVideoRecording();
            console.log("💾 Saving session video (size:", sessionVideoBlob.size, "bytes)");
            await videoDB.saveVideo(sessionVideoBlob);
            
            // Save interval videos
            console.log("🎬 Saving", photoVideos.length, "interval videos");
            for (const [i, videoBlob] of photoVideos.entries()) {
                console.log(`💾 Saving interval video ${i+1} (size: ${videoBlob.size} bytes)`);
                await videoDB.saveVideo(videoBlob);
            }

            // Save photos to localStorage as before
            localStorage.setItem('capturedPhotos', JSON.stringify(photos));
            
            captureBtn.textContent = 'Next';
            captureBtn.disabled = false;

            if (retryBtn) {
                retryBtn.style.display = 'flex';
                retryBtn.style.opacity = '1';
            }
            return;
        }

        startCountdown(async () => {
            // Stop current video segment
            if (count > 1) {
                const videoBlob = await stopVideoRecording();
                photoVideos.push(videoBlob);
            }

            // Take photo (existing code)
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

            provideFeedback();
            
            // Start recording next segment unless it's the last photo
            if (count < 4) {
                await startVideoRecording();
            }
            
            takeNextPhoto(count + 1);
        });
    }

    takeNextPhoto(1);
}
// Add these new functions to your existing codem
async function startVideoRecording() {
    try {
        const stream = video.srcObject;
        if (!stream) throw new Error('No video stream available');
        
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.start(100); // Capture data every 100ms
    } catch (error) {
        console.error('Error starting video recording:', error);
    }
}

async function stopVideoRecording() {
    return new Promise((resolve) => {
        mediaRecorder.onstop = () => {
            const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
            resolve(videoBlob);
        };
        mediaRecorder.stop();
    });
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
    frameGuideCtx.strokeStyle = 'rgba(94, 94, 94, 0.78)'; // White lines with transparency
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
    frameGuideCtx.strokeStyle = 'rgba(187, 187, 187, 0.81)'; // White lines with transparency
    frameGuideCtx.lineWidth = 0.5; // Thicker lines

    // Adjust the rule of thirds grid to make the middle section wider
    const middleSectionWidth = width * 0.8; // Middle section takes 50% of the width
    const sideSectionWidth = (width - middleSectionWidth) / 2; // Each side section takes 25% of the width

    // Draw the first and fourth vertical lines (thicker and different color)
    frameGuideCtx.strokeStyle = 'rgba(114, 97, 97, 0.88)'; // Red color for the outer lines
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
    frameGuideCtx.strokeStyle = 'rgba(94, 94, 94, 0.78)';

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

