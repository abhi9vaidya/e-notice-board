import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useTheme,
} from '@mui/material';
import { Menu as MenuIcon, Tv as TvIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface HeaderBarProps {
  title?: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title = 'Dashboard',
  onMenuClick,
  showMenuButton = false,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
        {showMenuButton && (
          <IconButton
            edge="start"
            color="primary"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h5"
          color="text.primary"
          fontWeight={600}
          sx={{ flex: 1 }}
        >
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="primary"
            onClick={() => navigate('/display')}
            title="Open TV Display"
            sx={{
              bgcolor: 'primary.lighter',
              '&:hover': {
                bgcolor: 'primary.light',
                color: 'white',
              },
            }}
          >
            <TvIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
