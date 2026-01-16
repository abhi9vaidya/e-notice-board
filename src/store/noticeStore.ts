import { create } from 'zustand';
import { Notice, NoticeFormData, NoticeCategory } from '@/models/notice';
import * as noticeService from '@/services/noticeService';
import * as storageService from '@/services/storageService';

interface NoticeStore {
  notices: Notice[];
  activeNotices: Notice[];
  isLoading: boolean;
  error: string | null;

  // Filters
  categoryFilter: NoticeCategory | 'All';
  statusFilter: 'All' | 'Active' | 'Expired' | 'Upcoming' | 'Archived';

  // Actions
  subscribeToNotices: () => () => void;
  subscribeToActiveNotices: () => () => void;
  createNotice: (formData: NoticeFormData, createdBy?: string) => Promise<Notice>;
  updateNotice: (id: string, payload: Partial<Notice>) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  togglePinned: (id: string, isPinned: boolean) => Promise<void>;

  // Filter actions
  setCategoryFilter: (category: NoticeCategory | 'All') => void;
  setStatusFilter: (status: 'All' | 'Active' | 'Expired' | 'Upcoming' | 'Archived') => void;

  // Selectors
  getFilteredNotices: () => Notice[];
}

export const useNoticeStore = create<NoticeStore>((set, get) => ({
  notices: [],
  activeNotices: [],
  isLoading: false,
  error: null,
  categoryFilter: 'All',
  statusFilter: 'All',

  subscribeToNotices: () => {
    set({ isLoading: true });

    return noticeService.subscribeToNotices((notices) => {
      set({ notices, isLoading: false, error: null });
    });
  },

  subscribeToActiveNotices: () => {
    set({ isLoading: true });

    return noticeService.subscribeToActiveNotices((activeNotices) => {
      set({ activeNotices, isLoading: false, error: null });
    });
  },

  createNotice: async (formData: NoticeFormData, createdBy?: string) => {
    set({ isLoading: true, error: null });

    try {
      let fileData;

      if (formData.file && (formData.type === 'Image' || formData.type === 'PDF')) {
        // Use Google Drive for storage to stay within Firebase free tier limits
        fileData = await storageService.uploadToDrive(formData.file);
      }

      const notice = await noticeService.createNotice(formData, fileData, createdBy);
      set({ isLoading: false });
      return notice;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create notice';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  updateNotice: async (id: string, payload: Partial<Notice>) => {
    set({ isLoading: true, error: null });

    try {
      await noticeService.updateNotice(id, payload);
      set({ isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update notice';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  deleteNotice: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const notice = get().notices.find(n => n.id === id);
      await noticeService.deleteNotice(id, notice?.fileUrl);
      set({ isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete notice';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  togglePinned: async (id: string, isPinned: boolean) => {
    try {
      await noticeService.togglePinned(id, isPinned);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to toggle pin';
      set({ error: message });
      throw error;
    }
  },

  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),

  getFilteredNotices: () => {
    const { notices, categoryFilter, statusFilter } = get();

    return notices
      .filter((notice) => {
        if (categoryFilter !== 'All' && notice.category !== categoryFilter) {
          return false;
        }

        if (statusFilter !== 'All') {
          // Handle 'Archived' status explicitly from the notice status field
          if (statusFilter === 'Archived') {
            return notice.status === 'Archived';
          }

          // Only show non-archived notices for the other filters
          if (notice.status === 'Archived') return false;

          const now = new Date();
          const isActive = notice.startDate <= now && notice.endDate >= now;
          const isExpired = notice.endDate < now;

          if (statusFilter === 'Active' && !isActive) return false;
          if (statusFilter === 'Expired' && !isExpired) return false;
          if (statusFilter === 'Upcoming' && (isActive || isExpired)) return false;
        } else {
          // By default, hide archived notices in 'All' view unless specifically requested
          return notice.status !== 'Archived';
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned first, then by creation date
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  },
}));
