import { useCallback, useEffect, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Box,
  IconButton,
  InputAdornment,
  Link,
  Snackbar,
  TextField,
  Typography,
  type AlertColor,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useResetPasswordMutation } from 'src/libs/service/auth/auth';

import { Iconify } from 'src/components/iconify';
import { hashPassword } from 'src/utils/ecrypt';

export function ResetPasswordView() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'error',
  });

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    const searchParams = window.location.search;
    const hashParams = window.location.hash.substring(1);

    const urlParams = new URLSearchParams(searchParams || hashParams);

    const accessKeyParam = urlParams.get('access_token');
    const refreshKeyParam = urlParams.get('refresh_token');
    const type = urlParams.get('type');


    if (type !== 'recovery') {
      setSnackbar({
        open: true,
        message: 'Invalid reset password link type. Please request a new password reset.',
        severity: 'error',
      });
      setTimeout(() => {
        router.push('/auth/sign-in');
      }, 3000);
      return;
    }

    if (!accessKeyParam || !refreshKeyParam) {
      setSnackbar({
        open: true,
        message: 'Missing access or refresh token. Please request a new password reset.',
        severity: 'error',
      });
      setTimeout(() => {
        router.push('/auth/sign-in');
      }, 3000);
      return;
    }

    setAccessToken(accessKeyParam);
    setRefreshToken(refreshKeyParam);
  }, [router]);

  const handleResetPassword = useCallback(async () => {
    if (password !== confirmPassword) {
      setSnackbar({
        open: true,
        message: 'Passwords do not match',
        severity: 'error',
      });
      return;
    }

    // Hash the password before sending to the server
    const hashedPassword = await hashPassword(password);

    try {
      await resetPassword({
        accessToken,
        refreshToken,
        password: hashedPassword,
      }).unwrap();

      setSnackbar({
        open: true,
        message: 'Password has been reset successfully',
        severity: 'success',
      });

      // Keep the success message visible for a moment before redirecting
      setTimeout(() => {
        router.push('/auth/sign-in');
      }, 3000);
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to reset password. Please try again.',
        severity: 'error',
      });
    }
  }, [password, confirmPassword, accessToken, refreshToken, resetPassword, router]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>
        <Typography variant="h4" paragraph>
          Reset Your Password
        </Typography>

        <Typography sx={{ color: 'text.secondary', mb: 5 }}>
          Please enter your new password.
        </Typography>

        <TextField
          fullWidth
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  <Iconify icon={showConfirmPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isLoading}
          onClick={handleResetPassword}
          sx={{ mb: 2 }}
        >
          Reset Password
        </LoadingButton>

        <Link
          component="button"
          variant="subtitle2"
          onClick={() => router.push('/auth/sign-in')}
          sx={{ display: 'block', textAlign: 'center' }}
        >
          Back to Login
        </Link>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
