import { NoticeFormData } from '@/models/notice';
import { isAfter, isBefore, startOfDay } from 'date-fns';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 4) return 'Password must be at least 4 characters';
  return null;
};

export const validateNoticeForm = (formData: NoticeFormData): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!formData.title?.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (formData.title.length > 200) {
    errors.push({ field: 'title', message: 'Title must be less than 200 characters' });
  }
  
  if (!formData.description?.trim()) {
    errors.push({ field: 'description', message: 'Description is required' });
  } else if (formData.description.length > 2000) {
    errors.push({ field: 'description', message: 'Description must be less than 2000 characters' });
  }
  
  if (!formData.category) {
    errors.push({ field: 'category', message: 'Category is required' });
  }
  
  if (!formData.type) {
    errors.push({ field: 'type', message: 'Notice type is required' });
  }
  
  if (!formData.startDate) {
    errors.push({ field: 'startDate', message: 'Start date is required' });
  }
  
  if (!formData.endDate) {
    errors.push({ field: 'endDate', message: 'End date is required' });
  }
  
  if (formData.startDate && formData.endDate) {
    const start = startOfDay(formData.startDate);
    const end = startOfDay(formData.endDate);
    
    if (isBefore(end, start)) {
      errors.push({ field: 'endDate', message: 'End date must be after start date' });
    }
  }
  
  if ((formData.type === 'Image' || formData.type === 'PDF') && !formData.file) {
    errors.push({ 
      field: 'file', 
      message: `${formData.type} file is required for ${formData.type} notices` 
    });
  }
  
  if (formData.file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (formData.file.size > maxSize) {
      errors.push({ field: 'file', message: 'File size must be less than 10MB' });
    }
    
    if (formData.type === 'Image') {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(formData.file.type)) {
        errors.push({ field: 'file', message: 'Please upload a valid image file (JPEG, PNG, GIF, WebP)' });
      }
    }
    
    if (formData.type === 'PDF') {
      if (formData.file.type !== 'application/pdf') {
        errors.push({ field: 'file', message: 'Please upload a valid PDF file' });
      }
    }
  }
  
  return errors;
};
