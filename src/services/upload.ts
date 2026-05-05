import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from './firebase';

export async function uploadImage(file: File, path: string): Promise<string> {
  if (!auth.currentUser) throw new Error('Unauthorized');
  
  const storageRef = ref(storage, `users/${auth.currentUser.uid}/${path}/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
}

export async function uploadCafeLogo(file: File): Promise<string> {
  return uploadImage(file, 'logos');
}

export async function uploadMenuItemImage(file: File): Promise<string> {
  return uploadImage(file, 'menu-items');
}
