import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  ThemeProvider,
  Paper,
  IconButton,
} from '@mui/material';
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Circle as DotIcon,
} from '@mui/icons-material';
import { tvTheme } from '@/theme/theme';
import { useNoticeStore } from '@/store/noticeStore';
import { NoticeCard } from '@/components/NoticeCard';
import { formatFullDate, formatTime } from '@/utils/date';
import { Notice } from '@/models/notice';

const NOTICES_PER_PAGE = 6;
const AUTO_ROTATE_INTERVAL = 10000; // 10 seconds

const Display: React.FC = () => {
  const { activeNotices, subscribeToActiveNotices } = useNoticeStore();
  const [currentPage, setCurrentPage] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Subscribe to active notices
  useEffect(() => {
    const unsubscribe = subscribeToActiveNotices();
    return () => unsubscribe();
  }, [subscribeToActiveNotices]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sort notices: pinned first, then by date
  const sortedNotices = useMemo(() => {
    return [...activeNotices].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }, [activeNotices]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedNotices.length / NOTICES_PER_PAGE);
  const currentNotices = sortedNotices.slice(
    currentPage * NOTICES_PER_PAGE,
    (currentPage + 1) * NOTICES_PER_PAGE
  );

  // Auto-rotate pages
  useEffect(() => {
    if (totalPages <= 1) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
        setIsTransitioning(false);
      }, 300);
    }, AUTO_ROTATE_INTERVAL);

    return () => clearInterval(timer);
  }, [totalPages]);

  // Reset page when notices change
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(0);
    }
  }, [totalPages, currentPage]);

  const handlePrevPage = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
      setIsTransitioning(false);
    }, 300);
  };

  const handleNextPage = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <ThemeProvider theme={tvTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Paper
          elevation={0}
          className="glass-header"
          sx={{
            background: `linear-gradient(135deg, ${tvTheme.palette.primary.main} 0%, ${tvTheme.palette.primary.dark} 100%)`,
            color: 'white',
            py: 4,
            px: { xs: 4, xl: 8 },
            borderRadius: 0,
            zIndex: 10,
          }}
        >
          <Box
            sx={{
              maxWidth: '1400px',
              mx: 'auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                RBU DIGITAL NOTICE BOARD
              </Typography>
              <Typography variant="h5" sx={{ opacity: 0.9, fontWeight: 500, letterSpacing: '0.02em' }}>
                Smart Information Display System
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h2" fontWeight={800}>
                {formatTime(currentTime)}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 600 }}>
                {formatFullDate(currentTime)}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Notices Grid */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 4, xl: 10 },
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? 'translateY(20px)' : 'translateY(0)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ maxWidth: '1400px', mx: 'auto', width: '100%', flex: 1 }}>
            {sortedNotices.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Paper className="glass-card" sx={{ p: 8, textAlign: 'center', maxWidth: 800 }}>
                  <Typography variant="h3" color="primary" fontWeight={700} gutterBottom>
                    No Active Notices
                  </Typography>
                  <Typography variant="h5" color="text.secondary">
                    Stay tuned! New important announcements will appear here.
                  </Typography>
                </Paper>
              </Box>
            ) : (
              <Grid container spacing={4}>
                {currentNotices.map((notice: Notice) => (
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4 }} key={notice.id}>
                    <NoticeCard notice={notice} tvMode />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              py: 3,
              bgcolor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <IconButton
              onClick={handlePrevPage}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <PrevIcon />
            </IconButton>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {Array.from({ length: totalPages }).map((_, index) => (
                <DotIcon
                  key={index}
                  sx={{
                    fontSize: 12,
                    color: index === currentPage ? 'primary.main' : 'grey.400',
                    transition: 'color 0.2s',
                  }}
                />
              ))}
            </Box>

            <IconButton
              onClick={handleNextPage}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <NextIcon />
            </IconButton>

            <Typography variant="body1" color="text.secondary" sx={{ ml: 2 }}>
              Page {currentPage + 1} of {totalPages}
            </Typography>
          </Box>
        )}

        {/* Footer */}
        <Box
          sx={{
            py: 2,
            px: 4,
            bgcolor: 'grey.900',
            color: 'grey.400',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2">
            Digital E-Notice Board System • Auto-refreshes every 30 seconds
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Display;
