import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  PushPin as PinIcon,
  PushPinOutlined as PinOutlinedIcon,
} from '@mui/icons-material';
import { Notice, getCategoryColor } from '@/models/notice';
import { formatDate, getNoticeStatus } from '@/utils/date';

interface NoticeCardProps {
  notice: Notice;
  onPin?: (id: string, isPinned: boolean) => void;
  showActions?: boolean;
  compact?: boolean;
  tvMode?: boolean;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({
  notice,
  onPin,
  showActions = false,
  compact = false,
  tvMode = false,
}) => {
  const status = getNoticeStatus(notice);
  const categoryColor = getCategoryColor(notice.category);

  const getStatusColor = () => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Expired':
        return 'error';
      case 'Upcoming':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: tvMode ? 'none' : 'translateY(-4px)',
          boxShadow: tvMode ? 3 : 6,
        },
        ...(notice.isPinned && {
          borderLeft: '4px solid',
          borderLeftColor: 'primary.main',
        }),
      }}
    >
      {/* Pinned indicator */}
      {notice.isPinned && (
        <Chip
          icon={<PinIcon sx={{ fontSize: 14 }} />}
          label="Pinned"
          size="small"
          color="primary"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 1,
          }}
        />
      )}

      {/* Image preview for image type notices */}
      {notice.type === 'Image' && notice.fileUrl && (
        <CardMedia
          component="img"
          height={compact ? 120 : tvMode ? 200 : 160}
          image={notice.fileUrl}
          alt={notice.title}
          sx={{ objectFit: 'cover' }}
        />
      )}

      {/* PDF preview */}
      {notice.type === 'PDF' && (
        <Box
          sx={{
            height: compact ? 80 : tvMode ? 140 : 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100',
            gap: 1,
          }}
        >
          <PdfIcon sx={{ fontSize: tvMode ? 48 : 36, color: 'error.main' }} />
          <Typography
            variant={tvMode ? 'body1' : 'body2'}
            color="text.secondary"
            noWrap
            sx={{ maxWidth: '60%' }}
          >
            {notice.fileName || 'PDF Document'}
          </Typography>
        </Box>
      )}

      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Category & Status chips */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={notice.category}
            size="small"
            sx={{
              bgcolor: `${categoryColor}20`,
              color: categoryColor,
              fontWeight: 600,
              fontSize: tvMode ? '0.875rem' : '0.75rem',
            }}
          />
          {!tvMode && (
            <Chip
              label={status}
              size="small"
              color={getStatusColor()}
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
        </Box>

        {/* Title */}
        <Typography
          variant={tvMode ? 'h5' : 'h6'}
          fontWeight={600}
          gutterBottom
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.3,
          }}
        >
          {notice.title}
        </Typography>

        {/* Description */}
        <Typography
          variant={tvMode ? 'body1' : 'body2'}
          color="text.secondary"
          sx={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: compact ? 2 : tvMode ? 4 : 3,
            WebkitBoxOrient: 'vertical',
            mb: 2,
          }}
        >
          {notice.description}
        </Typography>

        {/* Footer */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 'auto',
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: tvMode ? '0.9rem' : undefined }}
          >
            {formatDate(notice.startDate)} - {formatDate(notice.endDate)}
          </Typography>

          {showActions && onPin && (
            <Tooltip title={notice.isPinned ? 'Unpin' : 'Pin'}>
              <IconButton
                size="small"
                onClick={() => onPin(notice.id, !notice.isPinned)}
                color={notice.isPinned ? 'primary' : 'default'}
              >
                {notice.isPinned ? <PinIcon /> : <PinOutlinedIcon />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
