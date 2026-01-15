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
          sx={{
            background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 50%, #1a237e 100%)',
            color: 'white',
            py: 3,
            px: 4,
            borderRadius: 0,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="h3" fontWeight={700}>
                University Digital Notice Board
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mt: 0.5 }}>
                Department of Computer Science & Engineering
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" fontWeight={600}>
                {formatTime(currentTime)}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {formatFullDate(currentTime)}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Notices Grid */}
        <Box
          sx={{
            flex: 1,
            p: 4,
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? 'translateX(20px)' : 'translateX(0)',
            transition: 'opacity 0.3s, transform 0.3s',
          }}
        >
          {sortedNotices.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: 400,
              }}
            >
              <Paper sx={{ p: 6, textAlign: 'center', maxWidth: 600 }}>
                <Typography variant="h4" color="text.secondary" gutterBottom>
                  No Active Notices
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Check back later for important announcements and updates.
                </Typography>
              </Paper>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {currentNotices.map((notice: Notice) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={notice.id}>
                  <NoticeCard notice={notice} tvMode />
                </Grid>
              ))}
            </Grid>
          )}
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
