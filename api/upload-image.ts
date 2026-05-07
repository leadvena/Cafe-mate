import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';

// Disable body parsing, we'll use the built‑in form handling.
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  // Vercel's Node runtime provides a "files" property on the request when using multipart/form-data.
  // If not, you can use a library like "formidable"; for simplicity we assume the file arrives as req.files.image.
  const file = (req as any).files?.image;
  if (!file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    const blob = await put(file.name, file, { access: 'public' });
    return res.status(200).json({ url: blob.url });
  } catch (e) {
    console.error('Blob upload error', e);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
