import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Grid,
  Alert,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  CloudUpload as UploadIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  Refresh as ResetIcon,
} from '@mui/icons-material';
import {
  NoticeFormData,
  NoticeCategory,
  NoticeType,
  NOTICE_CATEGORIES,
  NOTICE_TYPES,
} from '@/models/notice';
import { validateNoticeForm, ValidationError } from '@/utils/validators';

interface NoticeFormProps {
  onSubmit: (formData: NoticeFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<NoticeFormData>;
}

const initialFormState: NoticeFormData = {
  title: '',
  description: '',
  category: 'General',
  type: 'Text',
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
  file: null,
};

export const NoticeForm: React.FC<NoticeFormProps> = ({
  onSubmit,
  isLoading = false,
  initialData,
}) => {
  const [formData, setFormData] = useState<NoticeFormData>({
    ...initialFormState,
    ...initialData,
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFieldError = (field: string): string | undefined => {
    return errors.find((e) => e.field === field)?.message;
  };

  const handleChange = (
    field: keyof NoticeFormData,
    value: string | Date | null | File
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => prev.filter((e) => e.field !== field));
    setSubmitError(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleChange('file', file);
  };

  const handleClearFile = () => {
    handleChange('file', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    setFormData({ ...initialFormState });
    setErrors([]);
    setSubmitError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateNoticeForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit(formData);
      handleReset();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to publish notice'
      );
    }
  };

  const showFileUpload = formData.type === 'Image' || formData.type === 'PDF';

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Create New Notice
        </Typography>

        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Notice Title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                error={!!getFieldError('title')}
                helperText={getFieldError('title')}
                required
                disabled={isLoading}
              />
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                error={!!getFieldError('description')}
                helperText={getFieldError('description')}
                multiline
                rows={4}
                required
                disabled={isLoading}
              />
            </Grid>

            {/* Category */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required error={!!getFieldError('category')}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) =>
                    handleChange('category', e.target.value as NoticeCategory)
                  }
                  disabled={isLoading}
                >
                  {NOTICE_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Notice Type */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required error={!!getFieldError('type')}>
                <InputLabel>Notice Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Notice Type"
                  onChange={(e) =>
                    handleChange('type', e.target.value as NoticeType)
                  }
                  disabled={isLoading}
                >
                  {NOTICE_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Start Date */}
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(date) => handleChange('startDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!getFieldError('startDate'),
                    helperText: getFieldError('startDate'),
                  },
                }}
                disabled={isLoading}
              />
            </Grid>

            {/* End Date */}
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(date) => handleChange('endDate', date)}
                minDate={formData.startDate || undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!getFieldError('endDate'),
                    helperText: getFieldError('endDate'),
                  },
                }}
                disabled={isLoading}
              />
            </Grid>

            {/* File Upload */}
            {showFileUpload && (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: getFieldError('file') ? 'error.main' : 'grey.300',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    bgcolor: 'grey.50',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'border-color 0.2s',
                    '&:hover': {
                      borderColor: isLoading ? 'grey.300' : 'primary.main',
                    },
                  }}
                  onClick={() => !isLoading && fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={formData.type === 'Image' ? 'image/*' : '.pdf'}
                    style={{ display: 'none' }}
                    disabled={isLoading}
                  />

                  {formData.file ? (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <Typography>{formData.file.name}</Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearFile();
                        }}
                        disabled={isLoading}
                      >
                        <ClearIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <>
                      <UploadIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
                      <Typography color="text.secondary">
                        Click to upload {formData.type.toLowerCase()} file
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formData.type === 'Image'
                          ? 'JPEG, PNG, GIF, WebP (Max 10MB)'
                          : 'PDF (Max 10MB)'}
                      </Typography>
                    </>
                  )}
                </Box>
                {getFieldError('file') && (
                  <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                    {getFieldError('file')}
                  </Typography>
                )}
              </Grid>
            )}

            {/* Action Buttons */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<ResetIcon />}
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    isLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  disabled={isLoading}
                >
                  {isLoading ? 'Publishing...' : 'Publish Notice'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};
