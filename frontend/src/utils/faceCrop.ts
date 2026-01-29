import * as faceapi from 'face-api.js';

// Base URL for models. In a production app, it is better to host these in your public/models folder.
// We use the GitHub pages hosting for convenience here.
const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

export const loadFaceModels = async () => {
    if (modelsLoaded) return;
    if (loadingPromise) return loadingPromise;

    loadingPromise = (async () => {
        try {
            console.log('Loading face detection models...');
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            // We only need the detector for the bounding box. 
            // If stricter alignment (eyes horizontal) is needed, we'd need landmarks.
            // But strict square cropping on the bounding box is usually sufficient and faster.
            modelsLoaded = true;
            console.log('Face detection models loaded.');
        } catch (err) {
            console.error("Failed to load face models", err);
            throw err;
        } finally {
            loadingPromise = null;
        }
    })();

    return loadingPromise;
};

/**
 * Detects a face in the provided image file and returns a square cropped blob centered on the face.
 * If no face is detected, it falls back to a center crop.
 */
export const cropToFace = async (imageFile: File): Promise<Blob> => {
    // 1. Create an HTMLImageElement from the file
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const url = URL.createObjectURL(imageFile);
        const image = new Image();
        image.src = url;
        // Important for cross-origin if using external images, but here we use a local blob/file so it's fine.
        image.onload = () => resolve(image);
        image.onerror = (e) => reject(e);
    });

    try {
        // 2. Load Models
        await loadFaceModels();

        // 3. Detect Face
        // Use TinyFaceDetector for speed. inputSize can be adjusted for trade-off between speed and accuracy.
        // default is 416.
        const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions());

        let cropX = 0, cropY = 0, cropSize = 0;

        if (detection) {
            console.log('Face detected', detection.box);
            const { x, y, width, height } = detection.box;
            const centerX = x + width / 2;
            const centerY = y + height / 2;

            // Determine crop size.
            // We want the face to occupy a good portion of the image, e.g., 60% of height.
            // cropSize = face dimension / 0.6
            const faceScale = 0.6;
            const computedSize = Math.max(width, height) / faceScale;

            // Constrain crop size to image dimensions (it can't be bigger than the image)
            const minImageDim = Math.min(img.width, img.height);
            cropSize = Math.min(computedSize, minImageDim);

            // Calculate top-left based on center
            cropX = centerX - cropSize / 2;
            cropY = centerY - cropSize / 2;

            // 4. Adjust to stay within bounds (Clamping)
            // This implicitly handles "if face too high, crop more from bottom" 
            // because we try to center it, but if we hit the top edge, we are forced to move the crop window down.
            if (cropX < 0) cropX = 0;
            if (cropY < 0) cropY = 0;
            if (cropX + cropSize > img.width) cropX = img.width - cropSize;
            if (cropY + cropSize > img.height) cropY = img.height - cropSize;

        } else {
            console.warn('No face detected, falling back to center crop');
            const minDim = Math.min(img.width, img.height);
            cropSize = minDim;
            cropX = (img.width - minDim) / 2;

            // If portrait (taller than wide), prioritize top area where face usually is.
            if (img.height > img.width) {
                cropY = 0; // Top aligned
            } else {
                cropY = (img.height - minDim) / 2; // Center aligned
            }
        }

        // 5. Draw to Canvas
        const canvas = document.createElement('canvas');
        canvas.width = cropSize;
        canvas.height = cropSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get canvas context");

        // Advanced: We could add clearRect here but new canvas is transparent/empty.
        // We might want a white background if the image has transparency? usually profile pics are rects.

        ctx.drawImage(img, cropX, cropY, cropSize, cropSize, 0, 0, cropSize, cropSize);

        // 6. Convert to Blob
        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (blob) resolve(blob);
                else reject(new Error("Canvas to Blob failed"));
            }, imageFile.type, 0.95); // High quality
        });
    } finally {
        // Cleanup object URL
        URL.revokeObjectURL(img.src);
    }
};
