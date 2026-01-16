import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  where,
} from 'firebase/firestore';
import { getFirebaseDb, isFirebaseConfigured } from './firebase';
import { Notice, NoticeFormData } from '@/models/notice';
import { isNoticeActive } from '@/utils/date';

// Mock notices for development
const generateMockNotices = (): Notice[] => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return [
    {
      id: '1',
      title: 'Mid-Semester Examination Schedule',
      description: 'Mid-semester examinations will commence from 15th February 2024. Students are requested to check their respective timetables and prepare accordingly.',
      category: 'Academic',
      type: 'Text',
      startDate: oneWeekAgo,
      endDate: oneWeekLater,
      isPinned: true,
      authorName: 'Examination Cell',
      authorVisibility: 'Public',
      createdAt: oneWeekAgo,
      updatedAt: oneWeekAgo,
      createdBy: 'faculty@university.edu',
    },
    {
      id: '2',
      title: 'Campus Placement Drive - TechCorp',
      description: 'TechCorp will be conducting a campus placement drive on 20th February. Eligible students should register before 18th February.',
      category: 'Placements',
      type: 'Text',
      startDate: oneWeekAgo,
      endDate: twoWeeksLater,
      isPinned: true,
      authorName: 'Placement Cell',
      authorVisibility: 'Public',
      createdAt: oneWeekAgo,
      updatedAt: oneWeekAgo,
      createdBy: 'faculty@university.edu',
    },
    {
      id: '3',
      title: 'Annual Tech Fest 2024',
      description: 'Register now for TechFest 2024! Events include hackathon, coding competitions, robotics showcase, and much more.',
      category: 'Events',
      type: 'Text',
      startDate: now,
      endDate: twoWeeksLater,
      isPinned: false,
      authorName: 'Student Council',
      authorVisibility: 'Public',
      createdAt: now,
      updatedAt: now,
      createdBy: 'faculty@university.edu',
    },
    {
      id: '4',
      title: 'Updated Class Timetable - Semester 4',
      description: 'The updated timetable for Semester 4 is now available. Please check the notice board or download from the student portal.',
      category: 'Timetable',
      type: 'PDF',
      startDate: oneWeekAgo,
      endDate: oneWeekLater,
      fileUrl: '/sample-timetable.pdf',
      fileName: 'Semester4_Timetable.pdf',
      fileType: 'application/pdf',
      isPinned: false,
      authorName: 'Academic Dept',
      authorVisibility: 'Internal',
      createdAt: oneWeekAgo,
      updatedAt: oneWeekAgo,
      createdBy: 'faculty@university.edu',
    },
    {
      id: '5',
      title: 'Library Timing Change',
      description: 'Library will remain open from 8 AM to 10 PM during examination period. Weekend hours: 9 AM to 6 PM.',
      category: 'General',
      type: 'Text',
      startDate: now,
      endDate: oneWeekLater,
      isPinned: false,
      authorName: 'Library Dept',
      authorVisibility: 'Public',
      createdAt: now,
      updatedAt: now,
      createdBy: 'faculty@university.edu',
    },
    {
      id: '6',
      title: 'Expired Notice - Test',
      description: 'This is an expired notice for testing purposes.',
      category: 'General',
      type: 'Text',
      startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      endDate: yesterday,
      isPinned: false,
      authorName: 'System admin',
      authorVisibility: 'Internal',
      createdAt: oneWeekAgo,
      updatedAt: oneWeekAgo,
      createdBy: 'faculty@university.edu',
    },
  ];
};

let mockNotices: Notice[] = generateMockNotices();

const mapFirestoreNotice = (id: string, data: any): Notice => ({
  id,
  title: data.title,
  // Support both 'description' (code) and 'content' (README)
  description: data.description || data.content || '',
  category: data.category,
  type: data.type,
  startDate: data.startDate?.toDate() || new Date(),
  endDate: data.endDate?.toDate() || new Date(),
  // Support both 'fileUrl' (code) and 'mediaUrl' (README)
  fileUrl: data.fileUrl || data.mediaUrl,
  fileName: data.fileName,
  fileType: data.fileType,
  authorName: data.authorName,
  authorVisibility: data.authorVisibility || 'Public',
  isPinned: data.isPinned || false,
  isActive: data.isActive !== undefined ? data.isActive : true,
  createdAt: data.createdAt?.toDate() || new Date(),
  updatedAt: data.updatedAt?.toDate() || new Date(),
  // Support both 'createdBy' (code) and 'postedBy' (README)
  createdBy: data.createdBy || data.postedBy || 'faculty@university.edu',
});

export const createNotice = async (
  formData: NoticeFormData,
  fileData?: { fileUrl: string; fileType: string; fileName: string },
  createdBy: string = 'faculty@university.edu'
): Promise<Notice> => {
  const now = new Date();

  const noticeData = {
    title: formData.title,
    description: formData.description,
    category: formData.category,
    type: formData.type,
    startDate: formData.startDate || now,
    endDate: formData.endDate || now,
    fileUrl: fileData?.fileUrl,
    fileName: fileData?.fileName,
    fileType: fileData?.fileType,
    authorName: formData.authorName,
    authorVisibility: formData.authorVisibility || 'Public',
    isPinned: false,
    isActive: true, // Default to true as per README
    createdAt: now,
    updatedAt: now,
    createdBy,
  };

  if (isFirebaseConfigured()) {
    const db = getFirebaseDb();
    if (!db) throw new Error('Firestore not initialized');

    const docRef = await addDoc(collection(db, 'notices'), {
      ...noticeData,
      startDate: Timestamp.fromDate(noticeData.startDate),
      endDate: Timestamp.fromDate(noticeData.endDate),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });

    return { id: docRef.id, ...noticeData };
  }

  // Mock create
  await new Promise((resolve) => setTimeout(resolve, 300));
  const newNotice: Notice = {
    id: `mock-${Date.now()}`,
    ...noticeData,
  };
  mockNotices = [newNotice, ...mockNotices];

  return newNotice;
};

export const updateNotice = async (
  id: string,
  payload: Partial<Notice>
): Promise<void> => {
  const now = new Date();

  if (isFirebaseConfigured()) {
    const db = getFirebaseDb();
    if (!db) throw new Error('Firestore not initialized');

    const updateData: any = { ...payload, updatedAt: Timestamp.fromDate(now) };
    if (payload.startDate) updateData.startDate = Timestamp.fromDate(payload.startDate);
    if (payload.endDate) updateData.endDate = Timestamp.fromDate(payload.endDate);

    await updateDoc(doc(db, 'notices', id), updateData);
    return;
  }

  // Mock update
  await new Promise((resolve) => setTimeout(resolve, 300));
  mockNotices = mockNotices.map((notice) =>
    notice.id === id ? { ...notice, ...payload, updatedAt: now } : notice
  );
};

export const deleteNoticeFile = async (fileUrl: string): Promise<void> => {
  // Use storageService to delete files
};

import { deleteNoticeFile as cleanupStaticFile } from './storageService';

export const deleteNotice = async (id: string, fileUrl?: string): Promise<void> => {
  if (isFirebaseConfigured()) {
    const db = getFirebaseDb();
    if (!db) throw new Error('Firestore not initialized');

    // 1. Delete associated file from Storage if exists
    if (fileUrl) {
      await cleanupStaticFile(fileUrl);
    }

    // 2. Delete notice document from Firestore
    await deleteDoc(doc(db, 'notices', id));
    return;
  }

  // Mock delete
  if (fileUrl) {
    await cleanupStaticFile(fileUrl);
  }
  await new Promise((resolve) => setTimeout(resolve, 300));
  mockNotices = mockNotices.filter((notice) => notice.id !== id);
};

export const togglePinned = async (id: string, isPinned: boolean): Promise<void> => {
  await updateNotice(id, { isPinned });
};

export const subscribeToNotices = (
  callback: (notices: Notice[]) => void
): (() => void) => {
  if (isFirebaseConfigured()) {
    const db = getFirebaseDb();
    if (!db) {
      callback([]);
      return () => { };
    }

    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const notices = snapshot.docs.map((doc) =>
        mapFirestoreNotice(doc.id, doc.data())
      );
      callback(notices);
    });
  }

  // Mock subscription
  callback(mockNotices);

  // Set up polling for mock updates
  const interval = setInterval(() => {
    callback(mockNotices);
  }, 2000);

  return () => clearInterval(interval);
};

export const subscribeToActiveNotices = (
  callback: (notices: Notice[]) => void
): (() => void) => {
  if (isFirebaseConfigured()) {
    const db = getFirebaseDb();
    if (!db) {
      callback([]);
      return () => { };
    }

    const now = new Date();
    const q = query(
      collection(db, 'notices'),
      where('startDate', '<=', Timestamp.fromDate(now)),
      orderBy('startDate', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notices = snapshot.docs
        .map((doc) => mapFirestoreNotice(doc.id, doc.data()))
        .filter(isNoticeActive);
      callback(notices);
    });
  }

  // Mock active notices
  const getActiveNotices = () => mockNotices.filter(isNoticeActive);
  callback(getActiveNotices());

  // Refresh every 30 seconds
  const interval = setInterval(() => {
    callback(getActiveNotices());
  }, 30000);

  return () => clearInterval(interval);
};

// Export mock notices for direct access in stores
export const getMockNotices = (): Notice[] => [...mockNotices];
export const setMockNotices = (notices: Notice[]): void => {
  mockNotices = notices;
};
