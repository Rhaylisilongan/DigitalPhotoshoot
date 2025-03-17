// Select elements
const collageCanvas = document.getElementById('collageCanvas');
const ctx = collageCanvas.getContext('2d');
const grayscaleFilter = document.getElementById('grayscaleFilter');
const sepiaFilter = document.getElementById('sepiaFilter');
const resetFilter = document.getElementById('resetFilter');
const textInput = document.getElementById('textInput');
const textColor = document.getElementById('textColor');
const fontSize = document.getElementById('fontSize');
const addText = document.getElementById('addText');
const downloadCollage = document.getElementById('downloadCollage');

// Load the collage image from localStorage
const collageData = localStorage.getItem('collage'); // Retrieve the collage data URL
console.log('Collage data from localStorage:', collageData); // Debug: Log the data URL

if (!collageData) {
    alert('No collage found. Please go back to the photobooth and create a collage.');
} else {
    const collageImage = new Image();
    collageImage.src = collageData;

    collageImage.onload = () => {
        console.log('Collage image loaded successfully.'); // Debug: Confirm image load
        // Set canvas dimensions to match the image
        collageCanvas.width = collageImage.width;
        collageCanvas.height = collageImage.height;

        // Draw the collage image on the canvas
        ctx.drawImage(collageImage, 0, 0);

        // Enable customization buttons
        grayscaleFilter.disabled = false;
        sepiaFilter.disabled = false;
        resetFilter.disabled = false;
        addText.disabled = false;
        downloadCollage.disabled = false;
    };

    collageImage.onerror = () => {
        console.error('Failed to load the collage image from localStorage.');
    };
}

// Apply Grayscale Filter
grayscaleFilter.addEventListener('click', () => {
    const imageData = ctx.getImageData(0, 0, collageCanvas.width, collageCanvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // Red
        data[i + 1] = avg; // Green
        data[i + 2] = avg; // Blue
    }

    ctx.putImageData(imageData, 0, 0);
});

// Apply Sepia Filter
sepiaFilter.addEventListener('click', () => {
    const imageData = ctx.getImageData(0, 0, collageCanvas.width, collageCanvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];

        data[i] = Math.min(255, (red * 0.393) + (green * 0.769) + (blue * 0.189)); // Red
        data[i + 1] = Math.min(255, (red * 0.349) + (green * 0.686) + (blue * 0.168)); // Green
        data[i + 2] = Math.min(255, (red * 0.272) + (green * 0.534) + (blue * 0.131)); // Blue
    }

    ctx.putImageData(imageData, 0, 0);
});

// Reset Filters
resetFilter.addEventListener('click', () => {
    const collageImage = new Image();
    collageImage.src = collageData;
    collageImage.onload = () => {
        ctx.drawImage(collageImage, 0, 0);
    };
});

// Add Text to Collage
addText.addEventListener('click', () => {
    const text = textInput.value;
    const color = textColor.value;
    const size = parseInt(fontSize.value);

    if (!text || isNaN(size)) {
        alert('Please enter valid text and font size.');
        return;
    }

    ctx.font = `${size}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text, collageCanvas.width / 2, collageCanvas.height - 20); // Add text at the bottom
});

// Download Collage
downloadCollage.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'custom-collage.png';
    link.href = collageCanvas.toDataURL('image/png');
    link.click();
});