import { put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Disable default body parsing so we can stream the raw binary to Blob
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-filename');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const filename = decodeURIComponent(
      (req.headers['x-filename'] as string) || `image-${Date.now()}.jpg`
    );
    const contentType = (req.headers['content-type'] as string) || 'image/jpeg';

    // Stream the raw request body directly to Vercel Blob
    const blob = await put(filename, req, {
      access: 'public',
      contentType,
    });

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error('Blob upload error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Upload failed',
    });
  }
}
