/**
 * Image upload service using Vercel Blob.
 *
 * Flow:
 * 1. Compress the image client-side (max 1200px, JPEG 80%) to stay under Vercel's 4.5 MB body limit.
 * 2. POST the raw binary to /api/upload-image (no multipart, no tokens).
 * 3. The serverless function streams it straight to Vercel Blob and returns a public URL.
 */

function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
        'image/jpeg',
        quality,
      );
    };
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadImage(file: File): Promise<string> {
  // Compress to JPEG so we stay well under the 4.5 MB serverless body limit
  const compressed = await compressImage(file);

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'image/jpeg',
      'x-filename': encodeURIComponent(file.name.replace(/\.[^.]+$/, '.jpg')),
    },
    body: compressed,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Image upload failed: ${err}`);
  }

  const { url } = await response.json();
  return url;
}

export async function uploadCafeLogo(file: File): Promise<string> {
  return uploadImage(file);
}

export async function uploadMenuItemImage(file: File): Promise<string> {
  return uploadImage(file);
}
