import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PushPin as PinIcon,
  PushPinOutlined as PinOutlinedIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  TextFields as TextIcon,
} from '@mui/icons-material';
import { Notice, NoticeCategory, NOTICE_CATEGORIES, getCategoryColor } from '@/models/notice';
import { formatDate, getNoticeStatus } from '@/utils/date';

interface NoticesTableProps {
  notices: Notice[];
  isLoading?: boolean;
  categoryFilter: NoticeCategory | 'All';
  statusFilter: 'All' | 'Active' | 'Expired' | 'Upcoming';
  onCategoryFilterChange: (category: NoticeCategory | 'All') => void;
  onStatusFilterChange: (status: 'All' | 'Active' | 'Expired' | 'Upcoming') => void;
  onEdit: (notice: Notice) => void;
  onDelete: (notice: Notice) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
}

export const NoticesTable: React.FC<NoticesTableProps> = ({
  notices,
  isLoading = false,
  categoryFilter,
  statusFilter,
  onCategoryFilterChange,
  onStatusFilterChange,
  onEdit,
  onDelete,
  onTogglePin,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Image':
        return <ImageIcon fontSize="small" />;
      case 'PDF':
        return <PdfIcon fontSize="small" />;
      default:
        return <TextIcon fontSize="small" />;
    }
  };

  const paginatedNotices = notices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ width: '100%' }}>
      {/* Filters */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) =>
                onCategoryFilterChange(e.target.value as NoticeCategory | 'All')
              }
            >
              <MenuItem value="All">All Categories</MenuItem>
              {NOTICE_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) =>
                onStatusFilterChange(
                  e.target.value as 'All' | 'Active' | 'Expired' | 'Upcoming'
                )
              }
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Expired">Expired</MenuItem>
              <MenuItem value="Upcoming">Upcoming</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ flex: 1 }} />

          <Typography variant="body2" color="text.secondary" alignSelf="center">
            {notices.length} notice{notices.length !== 1 ? 's' : ''} found
          </Typography>
        </Stack>
      </Box>

      {/* Table */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width={40}></TableCell>
              <TableCell>Title / Author</TableCell>
              <TableCell width={120}>Category</TableCell>
              <TableCell width={80}>Type</TableCell>
              <TableCell width={130}>Start Date</TableCell>
              <TableCell width={130}>End Date</TableCell>
              <TableCell width={100}>Status</TableCell>
              <TableCell width={140} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : paginatedNotices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No notices found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedNotices.map((notice) => {
                const status = getNoticeStatus(notice);
                const categoryColor = getCategoryColor(notice.category);

                return (
                  <TableRow
                    key={notice.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      bgcolor: notice.isPinned ? 'primary.50' : 'inherit',
                    }}
                  >
                    <TableCell>
                      {notice.isPinned && (
                        <PinIcon
                          fontSize="small"
                          color="primary"
                          sx={{ transform: 'rotate(45deg)' }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        fontWeight={500}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {notice.title}
                      </Typography>
                      {notice.authorName && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="caption" color="primary" fontWeight={600}>
                            {notice.authorName}
                          </Typography>
                          <Chip
                            label={notice.authorVisibility}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: '0.65rem',
                              height: 18,
                              borderColor: notice.authorVisibility === 'Internal' ? 'warning.light' : 'success.light',
                              color: notice.authorVisibility === 'Internal' ? 'warning.dark' : 'success.dark',
                            }}
                          />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notice.category}
                        size="small"
                        sx={{
                          bgcolor: `${categoryColor}20`,
                          color: categoryColor,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={notice.type}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          {getTypeIcon(notice.type)}
                          <Typography variant="body2">{notice.type}</Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{formatDate(notice.startDate)}</TableCell>
                    <TableCell>{formatDate(notice.endDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={status}
                        size="small"
                        color={getStatusColor(status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title={notice.isPinned ? 'Unpin' : 'Pin'}>
                          <IconButton
                            size="small"
                            onClick={() => onTogglePin(notice.id, !notice.isPinned)}
                            color={notice.isPinned ? 'primary' : 'default'}
                          >
                            {notice.isPinned ? <PinIcon /> : <PinOutlinedIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => onEdit(notice)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => onDelete(notice)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={notices.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper >
  );
};
