import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import { Snackbar, Alert, AlertColor } from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { useSignInWithEmailAndPasswordMutation } from 'src/libs/service/auth/auth';
import { setToken } from 'src/utils/auth';

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

  const handleSignIn = useCallback(async () => {
    try {
      const result = await signIn({ email, password }).unwrap();

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

  const renderForm = (
    <Box
      component="form"
      display="flex"
      flexDirection="column"
      alignItems="flex-end"
      onSubmit={(e) => {
        e.preventDefault();
        handleSignIn();
      }}
    >
      <TextField
        fullWidth
        name="email"
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 3 }}
        required
      />

      <Link
        href="/forgot-password"
        variant="body2"
        color="inherit"
        sx={{ alignSelf: 'start', mb: 1.5 }}
      >
        Forgot password?
      </Link>

      <TextField
        fullWidth
        name="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        InputLabelProps={{ shrink: true }}
        type={showPassword ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
        required
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        color="primary"
        variant="contained"
        loading={isLoading}
      >
        Sign In
      </LoadingButton>
    </Box>
  );

  return (
    <Box>
      <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Sign In</Typography>
        <Typography variant="body2" color="text.secondary">
          Don’t have an account?
          <Link
              variant="subtitle2"
              sx={{ ml: 0.5, cursor: 'pointer' }}
              onClick={(e) => {
                console.log('Link clicked');
                router.push('/sign-up');
              }}
            >
              Get started
            </Link>
        </Typography>
      </Box>

      {renderForm}
      {/* TODO */}
      {/* <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
        >
          OR
        </Typography>
      </Divider>

      <Box gap={1} display="flex" justifyContent="center">
        <IconButton color="inherit" aria-label="Sign in with Google">
          <Iconify icon="logos:google-icon" />
        </IconButton>
        <IconButton color="inherit" aria-label="Sign in with GitHub">
          <Iconify icon="eva:github-fill" />
        </IconButton>
        <IconButton color="inherit" aria-label="Sign in with Twitter">
          <Iconify icon="ri:twitter-x-fill" />
        </IconButton>
      </Box> */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
