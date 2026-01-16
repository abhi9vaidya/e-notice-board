import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  NotificationsActive as NoticeIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';
import { validateEmail, validatePassword } from '@/utils/validators';
import { isFirebaseConfigured } from '@/services/firebase';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(null);
    setError(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate inputs
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    if (emailErr) setEmailError(emailErr);
    if (passErr) setPasswordError(passErr);

    if (emailErr || passErr) return;

    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle at top right, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '140%',
          height: '140%',
          background: `radial-gradient(circle at bottom left, ${theme.palette.secondary.main}0d 0%, transparent 50%)`,
          zIndex: 0,
        }
      }}
    >
      <Card
        className="glass-card"
        sx={{
          maxWidth: 480,
          width: '100%',
          borderRadius: 4,
          boxShadow: '0 40px 100px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          zIndex: 1,
          overflow: 'visible',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <CardContent sx={{ p: { xs: 4, md: 6 } }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Box
              sx={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
                p: 1.5,
                border: '4px solid rgba(0, 58, 109, 0.05)',
              }}
            >
              <Box
                component="img"
                src="/logo.png"
                alt="RBU Logo"
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </Box>
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                letterSpacing: '-0.03em',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Faculty Login
            </Typography>
            <Typography variant="body1" color="text.secondary" fontWeight={500} sx={{ opacity: 0.8 }}>
              RBU Smart Display Portal
            </Typography>
          </Box>

          {/* Info alert for demo mode */}
          {!isFirebaseConfigured() && (
            <Alert
              severity="info"
              sx={{
                mb: 4,
                borderRadius: 2,
                bgcolor: 'rgba(21, 101, 192, 0.08)',
                border: '1px solid rgba(21, 101, 192, 0.1)',
                '& .MuiAlert-icon': { color: 'primary.main' }
              }}
            >
              <Typography variant="body2" fontWeight={500}>
                <strong>Demo Mode:</strong> Use any valid email and 4+ char password to sign in.
              </Typography>
            </Alert>
          )}

          {/* Error alert */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 4, borderRadius: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              error={!!emailError}
              helperText={emailError}
              disabled={isLoading}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.4)',
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'primary.light', opacity: 0.7 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
              disabled={isLoading}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.4)',
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'primary.light', opacity: 0.7 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'primary.light' }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                    disabled={isLoading}
                    sx={{ color: 'primary.light' }}
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Remember me
                  </Typography>
                }
              />
              <Typography variant="body2" color="primary" fontWeight={600} sx={{ cursor: 'pointer', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                Forgot Password?
              </Typography>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              className="grad-navy-orange"
              sx={{
                py: 2,
                fontSize: '1.05rem',
                fontWeight: 700,
                borderRadius: 2,
                boxShadow: '0 8px 24px rgba(0, 58, 109, 0.25)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 32px rgba(0, 58, 109, 0.35)',
                },
                '&:active': {
                  transform: 'translateY(-1px)',
                }
              }}
            >
              {isLoading ? (
                <CircularProgress size={26} color="inherit" />
              ) : (
                'Sign In to Dashboard'
              )}
            </Button>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            textAlign="center"
            mt={5}
            sx={{ fontWeight: 500, opacity: 0.7 }}
          >
            © 2026 Ramdeobaba University • Secure Faculty Access
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
