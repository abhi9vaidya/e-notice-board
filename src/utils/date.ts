import { Notice } from '@/models/notice';
import { format, isAfter, isBefore, isEqual, startOfDay, endOfDay } from 'date-fns';

export const isNoticeActive = (notice: Notice): boolean => {
  const now = new Date();
  const start = startOfDay(notice.startDate);
  const end = endOfDay(notice.endDate);

  return (
    (notice.isActive !== false) &&
    (isAfter(now, start) || isEqual(now, start)) &&
    (isBefore(now, end) || isEqual(now, end))
  );
};

export const isNoticeExpired = (notice: Notice): boolean => {
  const now = new Date();
  const end = endOfDay(notice.endDate);
  return isAfter(now, end);
};

export const isNoticeUpcoming = (notice: Notice): boolean => {
  const now = new Date();
  const start = startOfDay(notice.startDate);
  return isBefore(now, start);
};

export const getNoticeStatus = (notice: Notice): 'Active' | 'Expired' | 'Upcoming' | 'Archived' => {
  if (notice.status === 'Archived') return 'Archived';
  if (isNoticeActive(notice)) return 'Active';
  if (isNoticeExpired(notice)) return 'Expired';
  return 'Upcoming';
};

export const formatDate = (date: Date, formatStr: string = 'MMM dd, yyyy'): string => {
  return format(date, formatStr);
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'MMM dd, yyyy HH:mm');
};

export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm:ss');
};

export const formatFullDate = (date: Date): string => {
  return format(date, 'EEEE, MMMM dd, yyyy');
};
