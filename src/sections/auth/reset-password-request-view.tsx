import type { AlertColor} from '@mui/material';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import { Alert, Snackbar } from '@mui/material';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';

import { useRequestResetPasswordMutation } from 'src/libs/service/auth/auth';

export function ResetPasswordRequestView() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'error',
  });

  const [requestResetPassword, { isLoading }] = useRequestResetPasswordMutation();

  const handleRequestReset = useCallback(async () => {
    try {
      await requestResetPassword({ email }).unwrap();
      setSnackbar({
        open: true,
        message: 'Password reset instructions have been sent to your email',
        severity: 'success',
      });
      // Keep the success message visible for a moment before redirecting
      setTimeout(() => {
        router.push('/auth/sign-in');
      }, 3000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to request password reset. Please try again.',
        severity: 'error',
      });
    }
  }, [email, requestResetPassword, router]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>
        <Typography variant="h4" paragraph>
          Forgot your password?
        </Typography>

        <Typography sx={{ color: 'text.secondary', mb: 5 }}>
          Please enter your email address. We will send you instructions to reset your password.
        </Typography>

        <TextField
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          sx={{ mb: 3 }}
        />

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isLoading}
          onClick={handleRequestReset}
          sx={{ mb: 2 }}
        >
          Send Reset Instructions
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
