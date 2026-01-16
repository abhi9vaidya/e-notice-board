import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Grid,
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
  Divider,
  Stack,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
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
  const [focused, setFocused] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });
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
        bgcolor: 'background.default',
      }}
    >
      <Grid container sx={{ minHeight: '100vh' }}>
        {/* Brand / Visual Panel */}
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            px: { xs: 4, md: 10 },
            py: { xs: 6, md: 10 },
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            color: '#fff',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-20%',
              right: '-10%',
              width: '80%',
              height: '80%',
              background: `radial-gradient(circle, ${theme.palette.secondary.main}22 0%, transparent 70%)`,
              filter: 'blur(60px)',
              animation: 'pulse 10s infinite alternate',
            },
            '@keyframes pulse': {
              '0%': { transform: 'scale(1) translate(0, 0)' },
              '100%': { transform: 'scale(1.2) translate(10%, 10%)' },
            }
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 2 }}>
            <Stack spacing={3}>
              <Box
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 12px 30px rgba(0,0,0,0.25)'
                }}
              >
                <Box component="img" src="/logo.png" alt="RBU" sx={{ width: '64%', height: '64%', objectFit: 'contain' }} />
              </Box>
              <Typography variant="h2" fontWeight={900} sx={{ letterSpacing: '-0.04em', lineHeight: 1.1, textShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                RBU Smart<br />Notice Board
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.85, maxWidth: 480, lineHeight: 1.7, fontWeight: 400 }}>
                A next-generation information display system for Ramdeobaba University. Empowering faculty with real-time notice management.
              </Typography>

              <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Box>
                  <Typography variant="h5" fontWeight={700}>500+</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.6 }}>Active Students</Typography>
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>24/7</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.6 }}>Display System</Typography>
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>Instant</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.6 }}>Updates</Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 'auto', pt: 8 }}>
                <Typography variant="body2" sx={{ opacity: 0.5, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  © 2026 Ramdeobaba University • Admin Portal
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(500px 300px at 20% 10%, rgba(255,255,255,0.15), transparent 60%)',
            }}
          />
        </Grid>

        {/* Auth / Form Panel */}
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 4, md: 10 },
            py: { xs: 6, md: 10 },
            bgcolor: 'background.paper',
            position: 'relative',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 440 }}>
            <Box sx={{ mb: 6 }}>
              <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: '-0.04em', mb: 1, color: 'primary.dark' }}>
                Welcome back
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8, fontWeight: 500 }}>
                Sign in to manage notices for the RBU campus display system.
              </Typography>
            </Box>

            {!isFirebaseConfigured() && (
              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  bgcolor: 'rgba(21, 101, 192, 0.06)',
                  border: '1px solid rgba(21, 101, 192, 0.15)',
                  '& .MuiAlert-icon': { color: 'primary.main' }
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  <strong>Demo Mode:</strong> Use any valid email and 4+ character password to sign in.
                </Typography>
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.2}>
                <TextField
                  fullWidth
                  label="Email address"
                  type="email"
                  value={email}
                  onFocus={() => setFocused((f) => ({ ...f, email: true }))}
                  onBlur={() => setFocused((f) => ({ ...f, email: false }))}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  error={!!emailError}
                  helperText={emailError}
                  disabled={isLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 4,
                      bgcolor: 'rgba(0,0,0,0.02)',
                      transition: 'all .2s ease',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.04)',
                      },
                      '&.Mui-focused': {
                        bgcolor: '#fff',
                        boxShadow: `0 0 0 4px ${theme.palette.primary.main}15`,
                      }
                    },
                    '& input': {
                      py: 1.8,
                    },
                    '& input:-webkit-autofill': {
                      WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
                      WebkitTextFillColor: 'inherit !important',
                      transition: 'background-color 5000s ease-in-out 0s',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ ml: 1 }}>
                        <EmailIcon sx={{ color: 'primary.main', opacity: 0.7 }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onFocus={() => setFocused((f) => ({ ...f, password: true }))}
                  onBlur={() => setFocused((f) => ({ ...f, password: false }))}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  error={!!passwordError}
                  helperText={passwordError}
                  disabled={isLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 4,
                      bgcolor: 'rgba(0,0,0,0.02)',
                      transition: 'all .2s ease',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.04)',
                      },
                      '&.Mui-focused': {
                        bgcolor: '#fff',
                        boxShadow: `0 0 0 4px ${theme.palette.primary.main}15`,
                      }
                    },
                    '& input': {
                      py: 1.8,
                    },
                    '& input:-webkit-autofill': {
                      WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
                      WebkitTextFillColor: 'inherit !important',
                      transition: 'background-color 5000s ease-in-out 0s',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ ml: 1 }}>
                        <LockIcon sx={{ color: 'primary.main', opacity: 0.7 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end" sx={{ mr: 0.5 }}>
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'primary.main', opacity: 0.7 }}>
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        color="primary"
                        disabled={isLoading}
                        sx={{ color: 'primary.main' }}
                      />
                    }
                    label={<Typography variant="body2" color="text.secondary" fontWeight={600}>Remember me</Typography>}
                  />
                  <Typography variant="body2" color="primary" fontWeight={700} sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                    Forgot password?
                  </Typography>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    borderRadius: 3,
                    textTransform: 'none',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: `0 10px 30px ${theme.palette.primary.main}44`,
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&:hover': {
                      transform: 'translateY(-3px) scale(1.02)',
                      boxShadow: `0 15px 40px ${theme.palette.primary.main}66`,
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    },
                    '&:active': {
                      transform: 'translateY(0) scale(0.98)',
                    }
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Log In to Profile'}
                </Button>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Need help accessing your account?{' '}
                    <Typography component="span" variant="body2" color="primary" fontWeight={700} sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                      Contact IT Support
                    </Typography>
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Quick Access
                  </Typography>
                </Divider>

                <Button
                  component={Link}
                  to="/display"
                  fullWidth
                  variant="outlined"
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 700,
                    textTransform: 'none',
                    borderWidth: 2,
                    '&:hover': { borderWidth: 2 }
                  }}
                >
                  View Public Notice Board
                </Button>
              </Stack>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;
