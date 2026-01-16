import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  Grid,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  NotificationsActive as NoticeIcon,
  Schedule as ScheduleIcon,
  Archive as ArchiveIcon,
  CheckCircle as ActiveIcon,
  Error as ExpiredIcon,
} from '@mui/icons-material';
import { Sidebar, SIDEBAR_WIDTH } from '@/components/Sidebar';
import { HeaderBar } from '@/components/HeaderBar';
import { NoticeForm } from '@/components/NoticeForm';
import { NoticesTable } from '@/components/NoticesTable';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EditNoticeDialog } from '@/components/EditNoticeDialog';
import { useNoticeStore } from '@/store/noticeStore';
import { useAuthStore } from '@/store/authStore';
import { Notice, NoticeFormData } from '@/models/notice';
import { getNoticeStatus } from '@/utils/date';

// Dashboard Overview Component
const DashboardOverview: React.FC = () => {
  const { notices } = useNoticeStore();
  const theme = useTheme();

  const stats = {
    total: notices.length,
    active: notices.filter((n) => getNoticeStatus(n) === 'Active').length,
    expired: notices.filter((n) => getNoticeStatus(n) === 'Expired').length,
    upcoming: notices.filter((n) => getNoticeStatus(n) === 'Upcoming').length,
  };

  const statCards = [
    {
      label: 'Total Notices',
      value: stats.total,
      icon: <NoticeIcon />,
      color: theme.palette.primary.main,
      bgColor: '#e3f2fd',
    },
    {
      label: 'Active',
      value: stats.active,
      icon: <ActiveIcon />,
      color: theme.palette.success.main,
      bgColor: '#e8f5e9',
    },
    {
      label: 'Expired',
      value: stats.expired,
      icon: <ExpiredIcon />,
      color: theme.palette.error.main,
      bgColor: '#ffebee',
    },
    {
      label: 'Upcoming',
      value: stats.upcoming,
      icon: <ScheduleIcon />,
      color: theme.palette.info.main,
      bgColor: '#e1f5fe',
    },
  ];

  return (
    <Box sx={{ maxWidth: '1600px' }}>
      <Typography variant="h4" fontWeight={800} mb={4} sx={{ color: 'primary.main', letterSpacing: '-0.02em' }}>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={stat.label}>
            <Paper
              className="glass-card"
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 12px 30px rgba(0, 58, 109, 0.12)',
                },
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: stat.bgColor,
                  color: stat.color,
                }}
              >
                {React.cloneElement(stat.icon, { sx: { fontSize: 28 } })}
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={700} color={stat.color}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent notices preview */}
      <Box mt={4}>
        <Typography variant="h5" fontWeight={600} mb={2}>
          Recent Notices
        </Typography>
        <Paper sx={{ p: 3 }}>
          {notices.slice(0, 5).map((notice, index) => (
            <Box
              key={notice.id}
              sx={{
                py: 2,
                borderBottom: index < 4 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Typography fontWeight={500}>{notice.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {notice.category} • {getNoticeStatus(notice)}
              </Typography>
            </Box>
          ))}
          {notices.length === 0 && (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No notices yet. Create your first notice!
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

// Create Notice Page
const CreateNoticePage: React.FC = () => {
  const { createNotice, isLoading } = useNoticeStore();
  const { user } = useAuthStore();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: NoticeFormData) => {
    await createNotice(formData, user?.email);
    setSuccess(true);
  };

  return (
    <Box>
      <NoticeForm onSubmit={handleSubmit} isLoading={isLoading} />
      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Notice published successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

// All Notices Page
const AllNoticesPage: React.FC = () => {
  const {
    getFilteredNotices,
    categoryFilter,
    statusFilter,
    setCategoryFilter,
    setStatusFilter,
    deleteNotice,
    updateNotice,
    togglePinned,
    isLoading,
  } = useNoticeStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const filteredNotices = getFilteredNotices();

  const handleEdit = (notice: Notice) => {
    setSelectedNotice(notice);
    setEditDialogOpen(true);
  };

  const handleDelete = (notice: Notice) => {
    setSelectedNotice(notice);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedNotice) return;

    setActionLoading(true);
    try {
      await deleteNotice(selectedNotice.id);
      setSnackbar({
        open: true,
        message: 'Notice deleted successfully',
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to delete notice',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
      setSelectedNotice(null);
    }
  };

  const handleSaveEdit = async (id: string, updates: Partial<Notice>) => {
    setActionLoading(true);
    try {
      await updateNotice(id, updates);
      setSnackbar({
        open: true,
        message: 'Notice updated successfully',
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to update notice',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    try {
      await togglePinned(id, isPinned);
      setSnackbar({
        open: true,
        message: isPinned ? 'Notice pinned' : 'Notice unpinned',
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to update pin status',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} mb={3}>
        All Notices
      </Typography>

      <NoticesTable
        notices={filteredNotices}
        isLoading={isLoading}
        categoryFilter={categoryFilter}
        statusFilter={statusFilter}
        onCategoryFilterChange={setCategoryFilter}
        onStatusFilterChange={setStatusFilter}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePin={handleTogglePin}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Notice"
        message={`Are you sure you want to delete "${selectedNotice?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedNotice(null);
        }}
        isLoading={actionLoading}
      />

      {/* Edit Dialog */}
      <EditNoticeDialog
        open={editDialogOpen}
        notice={selectedNotice}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedNotice(null);
        }}
        onSave={handleSaveEdit}
        isLoading={actionLoading}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Archive Page Component
const ArchivePage: React.FC = () => {
  const {
    getFilteredNotices,
    setCategoryFilter,
    setStatusFilter,
    isLoading,
  } = useNoticeStore();

  // Set status filter to Archived on mount
  useEffect(() => {
    setStatusFilter('Archived');
    return () => setStatusFilter('All');
  }, [setStatusFilter]);

  const archivedNotices = getFilteredNotices();

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ letterSpacing: '-0.02em' }}>
            Notice Archive
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Long-term storage for historical notices and attachments
          </Typography>
        </Box>
        <Paper
          sx={{
            px: 2, py: 1,
            bgcolor: 'success.light',
            backgroundColor: (theme) => `${theme.palette.success.light}20`,
            color: 'success.dark',
            border: '1px solid',
            borderColor: 'success.light',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
          <Typography variant="caption" fontWeight={700}>GOOGLE DRIVE CONNECTED</Typography>
        </Paper>
      </Box>

      <NoticesTable
        notices={archivedNotices}
        isLoading={isLoading}
        categoryFilter="All"
        statusFilter="Archived"
        onCategoryFilterChange={setCategoryFilter}
        onStatusFilterChange={() => { }} // Disabled on archive page
        onEdit={() => { }} // Optional: might want to view but not edit
        onDelete={() => { }} // Optional
        onTogglePin={() => { }} // Pins not applicable for archive
      />
    </Box>
  );
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { subscribeToNotices } = useNoticeStore();

  // Subscribe to notices on mount
  useEffect(() => {
    const unsubscribe = subscribeToNotices();
    return () => unsubscribe();
  }, [subscribeToNotices]);

  // Redirect /dashboard to /dashboard (overview) or handle sub-routes
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      // Stay on overview
    }
  }, [location.pathname, navigate]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard/create':
        return 'Create Notice';
      case '/dashboard/notices':
        return 'All Notices';
      case '/dashboard/archive':
        return 'Notice Archive';
      default:
        return 'Dashboard';
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Sidebar
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        variant={isMobile ? 'temporary' : 'permanent'}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: isMobile ? 0 : `${SIDEBAR_WIDTH}px`,
          transition: 'margin 0.2s',
        }}
      >
        <HeaderBar
          title={getPageTitle()}
          onMenuClick={() => setMobileOpen(true)}
          showMenuButton={isMobile}
        />

        <Box sx={{ p: { xs: 2, md: 3 }, flex: 1, overflowY: 'auto' }}>
          <Box sx={{ width: '100%' }}>
            <Routes>
              <Route index element={<DashboardOverview />} />
              <Route path="create" element={<CreateNoticePage />} />
              <Route path="notices" element={<AllNoticesPage />} />
              <Route path="archive" element={<ArchivePage />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
