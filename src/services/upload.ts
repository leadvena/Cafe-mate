export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('image', file);

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: form,
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
