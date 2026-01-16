import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirebaseStorage, isFirebaseConfigured } from './firebase';

export interface UploadResult {
  fileUrl: string;
  fileType: string;
  fileName: string;
  fileId?: string;
}

const DRIVE_BRIDGE_URL = (import.meta as any).env?.VITE_GOOGLE_DRIVE_BRIDGE_URL;

/**
 * Uploads a file to Firebase Storage or returns a local object URL in mock mode
 */
export const uploadNoticeFile = async (file: File): Promise<UploadResult> => {
  if (isFirebaseConfigured()) {
    const storage = getFirebaseStorage();
    if (!storage) throw new Error('Firebase storage not initialized');

    // Create a unique file path
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const filePath = `notices/${timestamp}_${safeName}`;
    const storageRef = ref(storage, filePath);

    // Upload the file
    await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    });

    const fileUrl = await getDownloadURL(storageRef);

    return {
      fileUrl,
      fileType: file.type,
      fileName: file.name,
    };
  }

  // Mock upload logic
  await new Promise((resolve) => setTimeout(resolve, 800));
  const fileUrl = URL.createObjectURL(file);

  return {
    fileUrl,
    fileType: file.type,
    fileName: file.name,
  };
};

/**
 * Uploads a file to Google Drive via the Apps Script bridge
 */
export const uploadToDrive = async (file: File): Promise<UploadResult> => {
  if (!DRIVE_BRIDGE_URL) {
    console.warn('Google Drive Bridge URL not configured. Falling back to mock.');
    return uploadNoticeFile(file);
  }

  // Convert file to base64 for the Apps Script bridge
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  });

  try {
    const response = await fetch(DRIVE_BRIDGE_URL, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({
        filename: file.name,
        mimeType: file.type,
        data: base64
      })
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);

    return {
      fileUrl: result.viewUrl,
      fileId: result.fileId,
      fileType: file.type,
      fileName: file.name,
    };
  } catch (error) {
    console.error('Drive upload failed:', error);
    throw error;
  }
};

/**
 * Deletes a file from Firebase Storage
 */
export const deleteNoticeFile = async (fileUrl: string): Promise<void> => {
  if (!fileUrl) return;

  if (isFirebaseConfigured()) {
    const storage = getFirebaseStorage();
    if (!storage) return;

    try {
      // Extract the path from the Firebase URL
      // URL format: https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[path]?alt=media&token=[token]
      const decodedUrl = decodeURIComponent(fileUrl);
      const startIndex = decodedUrl.indexOf('/o/') + 3;
      const endIndex = decodedUrl.indexOf('?');
      const filePath = decodedUrl.substring(startIndex, endIndex);

      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
      console.log('File deleted successfully from Storage:', filePath);
    } catch (error) {
      console.error('Error deleting file from Storage:', error);
      // We don't throw here to ensure notice deletion continues even if file cleanup fails
    }
    return;
  }

  // Mock delete
  if (fileUrl.startsWith('blob:')) {
    URL.revokeObjectURL(fileUrl);
  }
};
