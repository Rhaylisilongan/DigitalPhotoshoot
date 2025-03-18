window.onload = function () {
    const collageCanvas = document.getElementById('collageCanvas');
    const ctx = collageCanvas?.getContext('2d');

    if (!collageCanvas || !ctx) {
        console.error("❌ Error: collageCanvas not found!");
        return;
    }

    let filter = "none";
    let bottomText = "";
    let textPosition = 20;
    let borderSize = 30;
    let bottomBorderSize = borderSize * 5;
    let gapSize = 25;
    let borderColor = "white";
    let textColor = "black";
    let fontSize = 30;
    let borderStyle = "normal"; // Default border style

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
    
        let width, height;
    
        if (borderStyle === "landscape") {
            // Adjustable canvas size for landscape layout
            width = 800; // Set your desired width for the canvas
            height = 600; // Set your desired height for the canvas
    
            // Adjustable gaps and borders for landscape mode
            const landscapeBorder = 20; // Border size for landscape mode
            const landscapeGap = 10; // Gap between photos in landscape mode
    
            collageCanvas.width = width;
            collageCanvas.height = height;
    
            ctx.clearRect(0, 0, collageCanvas.width, collageCanvas.height);
            ctx.fillStyle = borderColor;
            ctx.fillRect(0, 0, width, height);
    
            // Landscape style (2x2 grid)
            const photoWidth = (width - 2 * landscapeBorder - landscapeGap) / 2; // Width of each photo
            const photoHeight = (height - 2 * landscapeBorder - landscapeGap) / 2; // Height of each photo
    
            images.forEach((img, i) => {
                ctx.filter = filter;
                const row = Math.floor(i / 2); // Row index (0 or 1)
                const col = i % 2; // Column index (0 or 1)
                const x = col * (photoWidth + landscapeGap) + landscapeBorder; // X position
                const y = row * (photoHeight + landscapeGap) + landscapeBorder; // Y position
    
                // Calculate scaled dimensions to maintain aspect ratio
                const scale = Math.min(photoWidth / img.width, photoHeight / img.height);
                const scaledWidth = img.width * scale;
                const scaledHeight = img.height * scale;
    
                // Center the photo within the grid cell
                const offsetX = (photoWidth - scaledWidth) / 2;
                const offsetY = (photoHeight - scaledHeight) / 2;
    
                ctx.drawImage(img, x + offsetX, y + offsetY, scaledWidth, scaledHeight);
            });
        } else {
            // Default layout: vertical stack
            width = images[0].width + 2 * borderSize;
            height = images[0].height * 4 + 3 * gapSize + bottomBorderSize + borderSize;
    
            collageCanvas.width = width;
            collageCanvas.height = height;
    
            ctx.clearRect(0, 0, collageCanvas.width, collageCanvas.height);
            ctx.fillStyle = borderColor;
            ctx.fillRect(0, 0, width, height);
    
            // Draw images based on border style
            if (borderStyle === "normal") {
                // Normal border style (no changes)
                images.forEach((img, i) => {
                    ctx.filter = filter;
                    ctx.drawImage(img, borderSize, borderSize + i * (img.height + gapSize));
                });
            } else if (borderStyle === "film") {
                // Film border style (add square holes on the sides)
                images.forEach((img, i) => {
                    ctx.filter = filter;
                    ctx.drawImage(img, borderSize, borderSize + i * (img.height + gapSize));
    
                    // Draw square holes on the sides
                    ctx.fillStyle = "#dfdede"; // Black color for holes
                    const holeSize = 15; // Size of the square holes
                    const holeSpacing = 33; // Spacing between holes
                    const holeOffset = 7; // Offset from the edge
    
                    // Left side holes
                    for (let y = borderSize + holeOffset; y < height - holeOffset; y += holeSpacing) {
                        ctx.fillRect(holeOffset, y, holeSize, holeSize);
                    }
    
                    // Right side holes
                    for (let y = borderSize + holeOffset; y < height - holeOffset; y += holeSpacing) {
                        ctx.fillRect(width - holeSize - holeOffset, y, holeSize, holeSize);
                    }
                });
            }
        }
    
        // Draw bottom text
        ctx.fillStyle = textColor;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(bottomText, width / 2, height - textPosition);
    }

    // Filter Button Event Listeners
    document.querySelectorAll(".filter-button").forEach((button) => {
        button.addEventListener("click", (e) => {
            filter = e.target.dataset.filter;
            drawCollage();
        });
    });

    // Border Style Button Event Listeners
    document.querySelectorAll(".border-style-button").forEach((button) => {
        button.addEventListener("click", (e) => {
            // Remove active class from all buttons
            document.querySelectorAll(".border-style-button").forEach((btn) => {
                btn.classList.remove("active");
            });

            // Add active class to the clicked button
            e.target.classList.add("active");

            // Set the border style
            borderStyle = e.target.dataset.borderType;

            // If Film Border is selected, set border color to black
            if (borderStyle === "film") {
                borderColor = "black"; // Set border color to black
                document.getElementById("borderColor").value = "#000000"; // Update color picker
            }

            drawCollage(); // Redraw the collage
        });
    });

    // Color Button Event Listeners
    document.querySelectorAll(".color-button").forEach((button) => {
        button.addEventListener("click", (e) => {
            borderColor = e.target.dataset.color;
            document.getElementById("borderColor").value = borderColor;
            drawCollage();
        });
    });

    // Color Picker Event Listener
    document.getElementById("borderColor")?.addEventListener("input", (e) => {
        borderColor = e.target.value;
        drawCollage();
    });

    // Other Event Listeners
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