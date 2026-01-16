import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Close as CloseIcon } from '@mui/icons-material';
import {
  Notice,
  NoticeCategory,
  NOTICE_CATEGORIES,
} from '@/models/notice';

interface EditNoticeDialogProps {
  open: boolean;
  notice: Notice | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Notice>) => Promise<void>;
  isLoading?: boolean;
}

export const EditNoticeDialog: React.FC<EditNoticeDialogProps> = ({
  open,
  notice,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Notice>>({});

  React.useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title,
        description: notice.description,
        category: notice.category,
        startDate: notice.startDate,
        endDate: notice.endDate,
        authorName: notice.authorName || '',
        authorVisibility: notice.authorVisibility || 'Public',
      });
    }
  }, [notice]);

  const handleChange = (field: keyof Notice, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (notice) {
      await onSave(notice.id, formData);
      onClose();
    }
  };

  if (!notice) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', pr: 6 }}>
          <Typography variant="h6" component="span" fontWeight={600}>
            Edit Notice
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  disabled={isLoading}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  multiline
                  rows={4}
                  disabled={isLoading}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category || ''}
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

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Type"
                  value={notice.type}
                  disabled
                  helperText="Notice type cannot be changed"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Author / Department"
                  value={formData.authorName || ''}
                  onChange={(e) => handleChange('authorName', e.target.value)}
                  disabled={isLoading}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Visibility</InputLabel>
                  <Select
                    value={formData.authorVisibility || 'Public'}
                    label="Visibility"
                    onChange={(e) =>
                      handleChange('authorVisibility', e.target.value as 'Internal' | 'Public')
                    }
                    disabled={isLoading}
                  >
                    <MenuItem value="Public">Public (Show on TV)</MenuItem>
                    <MenuItem value="Internal">Internal (Faculty Only)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate || null}
                  onChange={(date) => handleChange('startDate', date)}
                  slotProps={{
                    textField: { fullWidth: true },
                  }}
                  disabled={isLoading}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate || null}
                  onChange={(date) => handleChange('endDate', date)}
                  minDate={formData.startDate || undefined}
                  slotProps={{
                    textField: { fullWidth: true },
                  }}
                  disabled={isLoading}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};
