export type NoticeCategory = 'Academic' | 'Timetable' | 'Placements' | 'Events' | 'General';
export type NoticeType = 'Text' | 'Image' | 'PDF';

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: NoticeCategory;
  type: NoticeType;
  startDate: Date;
  endDate: Date;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  isPinned: boolean;
  authorName?: string;
  authorVisibility: 'Internal' | 'Public';
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface NoticeFormData {
  title: string;
  description: string;
  category: NoticeCategory;
  type: NoticeType;
  startDate: Date | null;
  endDate: Date | null;
  file?: File | null;
  authorName?: string;
  authorVisibility: 'Internal' | 'Public';
}

export const NOTICE_CATEGORIES: NoticeCategory[] = [
  'Academic',
  'Timetable',
  'Placements',
  'Events',
  'General',
];

export const NOTICE_TYPES: NoticeType[] = ['Text', 'Image', 'PDF'];

export const getCategoryColor = (category: NoticeCategory): string => {
  const colors: Record<NoticeCategory, string> = {
    Academic: '#1565c0',
    Timetable: '#7b1fa2',
    Placements: '#2e7d32',
    Events: '#e65100',
    General: '#455a64',
  };
  return colors[category];
};
