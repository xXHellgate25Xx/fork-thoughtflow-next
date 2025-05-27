import type { AlertColor } from '@mui/material';

import { useCallback, useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Alert, Box, Button, Divider, Link, Snackbar, TextField, Typography } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { setToken } from 'src/utils/auth';
import { hashPassword } from 'src/utils/ecrypt';

import { useSignInWithEmailAndPasswordMutation, useSignInWithOAuthMutation } from 'src/libs/service/auth/auth';

import { Iconify } from 'src/components/iconify';


export function SignInView() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'error',
  });

  const [signIn, { isLoading }] = useSignInWithEmailAndPasswordMutation();

  const [signInWithOAuth] = useSignInWithOAuthMutation();
  const handleGoogleSignIn = useCallback(async () => {
    try {
      const result = await signInWithOAuth({ provider: 'google' }).unwrap();
      window.location.href = result.data.url;
    } catch (err) {
      console.error('Google sign-in error:', err);
      setSnackbar({
        open: true,
        message: 'Failed to initiate Google sign-in',
        severity: 'error',
      });
    }
  }, []);

  const handleSignIn = useCallback(async () => {
    try {
      const hashedPassword = await hashPassword(password);
      const result = await signIn({ email, password: hashedPassword }).unwrap();

      if (result.error) {
        setSnackbar({
          open: true,
          message: `Sign-in failed: ${result.error.code} - ${result.error.name}`,
          severity: 'error',
        });
      } else if (result.data) {
        const { session } = result.data;
        if (session?.access_token && session?.refresh_token) {
          setToken(session.access_token, session.refresh_token);
          router.push('/select-account');
        } else {
          console.warn('Sign-in successful but no session data found.');
        }
      } else {
        console.warn('Unexpected response format:', result);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'An unexpected error occurred. Please try again.',
        severity: 'error',
      });
      console.error('An unexpected error occurred:', err);
    }
  }, [email, password, signIn, router]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleGetStartedClick = useCallback(() => {
    console.log('Link clicked');
    router.push('/auth/sign-up');
  }, [router]);

  return (
    <Box >
      <Typography variant="h4" align="center" gutterBottom>
        Sign In
      </Typography>

      <Typography variant="body2" align="center" sx={{ mb: 3 }}>
        {`Don't have an account? `}
        <Link
          variant="subtitle2"
          sx={{ ml: 0.5, cursor: 'pointer' }}
          onClick={handleGetStartedClick}
        >
          Get started
        </Link>
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Email Address *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          fullWidth
          label="Password *"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <Button
                onClick={() => setShowPassword(!showPassword)}
                sx={{ minWidth: 'auto', p: 0.5 }}
              >
                <Iconify icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'} />
              </Button>
            ),
          }}
        />
        <Link
          variant="subtitle2"
          sx={{ alignSelf: 'flex-start', cursor: 'pointer', ml: 1 }}
          onClick={() => router.push('/auth/reset-password-request')}
        >
          Forgot password?
        </Link>

        <LoadingButton
          fullWidth
          size="large"
          variant="contained"
          loading={isLoading}
          onClick={handleSignIn}
          sx={{ mt: 1 }}
        >
          Sign In
        </LoadingButton>

        <Divider sx={{ my: 0 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Or continue with
          </Typography>
        </Divider>

        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={<Iconify icon="mdi:google" />}
          onClick={handleGoogleSignIn}
        >
          Continue with Google
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
