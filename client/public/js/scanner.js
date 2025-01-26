// Document scanning and image processing utilities
class DocumentScanner {
    constructor() {
        this.scannerElement = null;
        this.video = null;
        this.canvas = null;
        this.captureButton = null;
        this.stream = null;
        this.onPhotoCapture = null;
        this.aspectRatio = {
            passport: { width: 35, height: 45 }, // mm
            document: { width: 210, height: 297 } // A4 size in mm
        };
    }

    async initialize(containerId, mode = 'passport') {
        this.scannerElement = document.getElementById(containerId);
        if (!this.scannerElement) throw new Error('Scanner container not found');

        // Create scanner UI
        this.scannerElement.innerHTML = `
            <div class="scanner-container ${mode}-mode">
                <video id="scanner-video" playsinline autoplay></video>
                <canvas id="scanner-canvas" style="display: none;"></canvas>
                <div class="scanner-overlay">
                    <div class="scan-region"></div>
                </div>
                <div class="scanner-controls">
                    <button class="capture-btn">Capture</button>
                    <button class="switch-camera-btn">Switch Camera</button>
                    <button class="close-scanner-btn">Close</button>
                </div>
            </div>
        `;

        this.video = this.scannerElement.querySelector('#scanner-video');
        this.canvas = this.scannerElement.querySelector('#scanner-canvas');
        this.captureButton = this.scannerElement.querySelector('.capture-btn');

        // Set up event listeners
        this.captureButton.addEventListener('click', () => this.captureImage());
        this.scannerElement.querySelector('.close-scanner-btn').addEventListener('click', () => this.close());
        this.scannerElement.querySelector('.switch-camera-btn').addEventListener('click', () => this.switchCamera());

        // Apply mode-specific styles
        this.applyModeStyles(mode);

        // Start camera
        await this.startCamera();
    }

    applyModeStyles(mode) {
        const overlay = this.scannerElement.querySelector('.scan-region');
        if (mode === 'passport') {
            overlay.style.aspectRatio = '35/45';
            overlay.style.width = '200px';
        } else {
            overlay.style.aspectRatio = '210/297';
            overlay.style.width = '80%';
        }
    }

    async startCamera(facingMode = 'user') {
        try {
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }

            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            this.video.srcObject = this.stream;
            await this.video.play();
        } catch (error) {
            console.error('Error accessing camera:', error);
            throw error;
        }
    }

    async switchCamera() {
        const currentFacingMode = this.stream.getVideoTracks()[0].getSettings().facingMode;
        await this.startCamera(currentFacingMode === 'user' ? 'environment' : 'user');
    }

    captureImage() {
        const context = this.canvas.getContext('2d');
        const overlay = this.scannerElement.querySelector('.scan-region');
        const rect = overlay.getBoundingClientRect();
        const videoRect = this.video.getBoundingClientRect();

        // Calculate scaling factors
        const scaleX = this.video.videoWidth / videoRect.width;
        const scaleY = this.video.videoHeight / videoRect.height;

        // Set canvas size to match the overlay region
        this.canvas.width = rect.width * scaleX;
        this.canvas.height = rect.height * scaleY;

        // Calculate source coordinates
        const sx = (rect.left - videoRect.left) * scaleX;
        const sy = (rect.top - videoRect.top) * scaleY;
        const sWidth = rect.width * scaleX;
        const sHeight = rect.height * scaleY;

        // Draw the cropped image
        context.drawImage(this.video,
            sx, sy, sWidth, sHeight,
            0, 0, this.canvas.width, this.canvas.height
        );

        // Convert to file
        this.canvas.toBlob(blob => {
            const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
            if (this.onPhotoCapture) {
                this.onPhotoCapture(file);
            }
        }, 'image/jpeg', 0.95);
    }

    close() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        this.scannerElement.innerHTML = '';
    }

    setOnPhotoCapture(callback) {
        this.onPhotoCapture = callback;
    }
}

// Document processing utilities
class DocumentProcessor {
    static async enhanceDocument(file) {
        return new Promise((resolve) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                // Set canvas size
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw original image
                ctx.drawImage(img, 0, 0);

                // Apply enhancements
                this.applyDocumentEnhancements(ctx, canvas.width, canvas.height);

                // Convert back to file
                canvas.toBlob(blob => {
                    const enhancedFile = new File([blob], 'enhanced-' + file.name, {
                        type: 'image/jpeg'
                    });
                    resolve(enhancedFile);
                }, 'image/jpeg', 0.95);
            };

            img.src = URL.createObjectURL(file);
        });
    }

    static applyDocumentEnhancements(ctx, width, height) {
        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Apply contrast and brightness adjustments
        for (let i = 0; i < data.length; i += 4) {
            // Increase contrast
            for (let j = 0; j < 3; j++) {
                const pixel = data[i + j];
                data[i + j] = pixel < 128 ? pixel * 0.8 : pixel * 1.2;
            }
        }

        // Apply the modified image data
        ctx.putImageData(imageData, 0, 0);

        // Apply sharpening
        ctx.filter = 'contrast(120%) brightness(105%) saturate(90%)';
        ctx.drawImage(ctx.canvas, 0, 0);
        ctx.filter = 'none';
    }
}
