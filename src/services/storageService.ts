import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage, isFirebaseConfigured } from './firebase';

export interface UploadResult {
  fileUrl: string;
  fileType: string;
  fileName: string;
}

export const uploadNoticeFile = async (file: File): Promise<UploadResult> => {
  if (isFirebaseConfigured()) {
    const storage = getFirebaseStorage();
    if (!storage) throw new Error('Firebase storage not initialized');
    
    const timestamp = Date.now();
    const fileName = `notices/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const fileUrl = await getDownloadURL(storageRef);
    
    return {
      fileUrl,
      fileType: file.type,
      fileName: file.name,
    };
  }
  
  // Mock upload - create object URL
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const fileUrl = URL.createObjectURL(file);
  
  return {
    fileUrl,
    fileType: file.type,
    fileName: file.name,
  };
};

export const deleteNoticeFile = async (fileUrl: string): Promise<void> => {
  if (isFirebaseConfigured()) {
    // In real implementation, extract path from URL and delete
    console.log('Deleting file:', fileUrl);
    return;
  }
  
  // Mock delete - revoke object URL if it's a blob URL
  if (fileUrl.startsWith('blob:')) {
    URL.revokeObjectURL(fileUrl);
  }
};
