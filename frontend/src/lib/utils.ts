
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
    
    // We only compress if it's larger than 1MB to save processing for small ones
    if (file.size < 1000 * 1024) return file;

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

                // Max dimensions (e.g., 1600px width for HD quality)
                const MAX_WIDTH = 1600;
                if (width > MAX_WIDTH) {
                    height = (MAX_WIDTH / width) * height;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // Export as JPEG with 0.6 quality (High compression, decent look)
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        }));
                    } else {
                        resolve(file);
                    }
                }, 'image/jpeg', 0.6);
            };
        };
    });
};
