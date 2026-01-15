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
      position="sticky"
      elevation={0}
      className="glass-header"
      sx={{
        top: 0,
        zIndex: theme.zIndex.appBar,
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 3 }, minHeight: 70 }}>
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Box
            component="img"
            src="/logo.png"
            alt="University Logo"
            sx={{
              height: 48,
              width: 48,
              objectFit: 'contain',
              display: { xs: 'none', sm: 'block' },
            }}
          />
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              letterSpacing: '-0.01em',
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={() => navigate('/display')}
            title="Open TV Display"
            sx={{
              bgcolor: 'rgba(0, 58, 109, 0.05)',
              color: 'primary.main',
              border: '1px solid',
              borderColor: 'rgba(0, 58, 109, 0.1)',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s',
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
