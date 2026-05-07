import { upload } from '@vercel/blob/client';

/**
 * Upload an image directly to Vercel Blob from the browser.
 * The file goes straight from the client to Blob storage,
 * bypassing the 4.5 MB serverless function body limit.
 */
export async function uploadImage(file: File): Promise<string> {
  const blob = await upload(file.name, file, {
    access: 'public',
    handleUploadUrl: '/api/upload-image',
  });

  return blob.url;
}

export async function uploadCafeLogo(file: File): Promise<string> {
  return uploadImage(file);
}

export async function uploadMenuItemImage(file: File): Promise<string> {
  return uploadImage(file);
}
