
export const fixUrl = (url: string | null | undefined) => {
    if (!url || typeof url !== 'string' || url === '') return '/default_avatar.png';
    if (url.startsWith('http')) return `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
    
    const baseOrigin = 'https://hoopcasting.com';
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    if (cleanUrl.includes('/php_backend/uploads/')) {
        return `${baseOrigin}${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    }
    
    return `${baseOrigin}/php_backend/uploads${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
}

/**
 * Compresses an image file on the client side before upload.
 * Reduces dimensions and quality to save space (MB to KB).
 */
export const compressImage = async (file: File): Promise<File | Blob> => {
    if (!file.type.startsWith('image/')) return file;
    
    // Compress ALL images as requested to save space
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Max dimensions to ensure very small size
                const MAX_WIDTH = 1200;
                if (width > MAX_WIDTH) {
                    height = (MAX_WIDTH / width) * height;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // Export as WEBP with 0.7 quality (Best compression, great look)
                canvas.toBlob((blob) => {
                    if (blob) {
                        const newFilename = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                        resolve(new File([blob], newFilename, {
                            type: 'image/webp',
                            lastModified: Date.now(),
                        }));
                    } else {
                        resolve(file);
                    }
                }, 'image/webp', 0.7);
            };
        };
    });
};
