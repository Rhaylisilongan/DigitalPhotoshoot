window.onload = function () {
    const collageCanvas = document.getElementById('collageCanvas');
    const ctx = collageCanvas?.getContext('2d');

    if (!collageCanvas || !ctx) {
        console.error("❌ Error: collageCanvas not found!");
        return;
    }

    let filter = "none";
    let bottomText = "";
    let textPosition = 20; // Default text position from bottom
    let borderSize = 30;
    let bottomBorderSize = borderSize * 5;
    let gapSize = 25;
    let borderColor = "white";
    let textColor = "black";
    let fontSize = 30;

    // Retrieve the stored images from localStorage
    const savedPhotos = localStorage.getItem("capturedPhotos");
    if (!savedPhotos) {
        alert("⚠️ No photos found. Please go back to the photobooth and take four photos.");
        return;
    }

    const photos = JSON.parse(savedPhotos);
    if (photos.length < 4) {
        alert("⚠️ Not enough photos found. Please take four photos in the photobooth.");
        return;
    }

    console.log("📸 Photos found, loading collage...");

    // Create Image elements for the four photos
    const images = photos.map((src) => {
        const img = new Image();
        img.src = src;
        return img;
    });

    let loadedImages = 0;

    images.forEach((img, index) => {
        img.onload = function () {
            loadedImages++;
            if (loadedImages === 4) {
                console.log("✅ All images loaded, drawing collage...");
                drawCollage();
            }
        };

        img.onerror = function () {
            console.error(`❌ Failed to load image ${index + 1}`);
        };
    });

    function drawCollage() {
        if (loadedImages !== 4) return;

        const width = images[0].width + 2 * borderSize;
        const height = images[0].height * 4 + 3 * gapSize + bottomBorderSize + borderSize;
        collageCanvas.width = width;
        collageCanvas.height = height;

        ctx.clearRect(0, 0, collageCanvas.width, collageCanvas.height);
        ctx.fillStyle = borderColor;
        ctx.fillRect(0, 0, width, height);

        images.forEach((img, i) => {
            ctx.filter = filter;
            ctx.drawImage(img, borderSize, borderSize + i * (img.height + gapSize));
        });

        // Draw bottom text
        ctx.fillStyle = textColor;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(bottomText, width / 2, height - textPosition);
    }

    // Customization event listeners
    document.getElementById("filterSelect")?.addEventListener("change", (e) => {
        filter = e.target.value;
        drawCollage();
    });

    document.getElementById("borderColor")?.addEventListener("input", (e) => {
        borderColor = e.target.value;
        drawCollage();
    });

    document.getElementById("bottomTextInput")?.addEventListener("input", (e) => {
        bottomText = e.target.value;
        drawCollage();
    });

    document.getElementById("textPosition")?.addEventListener("input", (e) => {
        textPosition = parseInt(e.target.value, 10);
        drawCollage();
    });

    document.getElementById("textColor")?.addEventListener("input", (e) => {
        textColor = e.target.value;
        drawCollage();
    });

    document.getElementById("fontSize")?.addEventListener("input", (e) => {
        fontSize = parseInt(e.target.value, 10);
        drawCollage();
    });

    document.getElementById("downloadButton")?.addEventListener("click", () => {
        const link = document.createElement("a");
        link.download = "collage.png";
        link.href = collageCanvas.toDataURL("image/png");
        link.click();
    });
};
