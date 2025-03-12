import LoadingButton from "@mui/lab/LoadingButton"
import { Alert, type AlertColor, Button, Snackbar } from "@mui/material"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import Link from "@mui/material/Link"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useCallback, useState } from "react"

import { Iconify } from "src/components/iconify"
import { useSignUpWithEmailAndPasswordMutation } from "src/libs/service/auth/auth"
import { useRouter } from "src/routes/hooks"
import { hashPassword } from "src/utils/ecrypt"

export function SignUpView() {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")

  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: AlertColor
    isSuccess?: boolean
  }>({
    open: false,
    message: "",
    severity: "error",
    isSuccess: false,
  })

  const [signUp, { isLoading }] = useSignUpWithEmailAndPasswordMutation()

  const handleSignUp = useCallback(async () => {
    if (password !== confirmPassword) {
      setSnackbar({
        open: true,
        message: "Passwords do not match",
        severity: "error",
      })
      return
    }

    try {
      // Hash the password before sending
      const hashedPassword = await hashPassword(password);
      const result = await signUp({ email, password: hashedPassword, displayName }).unwrap()
      console.log("result: ", result)
      if (result.error) {
        setSnackbar({
          open: true,
          message: `Sign-up failed: ${result.error.code} - ${result.error.name}`,
          severity: "error",
        })
      } else if (result.data) {
        setSnackbar({
          open: true,
          message: "Sign up successfully!\nPlease check your mailbox for a verification email.",
          severity: "success",
          isSuccess: true,
        })
      } else {
        console.warn("Unexpected response format:", result)
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "An unexpected error occurred. Please try again.",
        severity: "error",
      })
      console.error("An unexpected error occurred:", err)
    }
  }, [email, password, confirmPassword, displayName, signUp])

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const handleGoToSignIn = () => {
    handleCloseSnackbar()
    router.push("/auth/sign-in")
  }

  const renderForm = (
    <Box
      component="form"
      display="flex"
      flexDirection="column"
      alignItems="flex-end"
      onSubmit={(e) => {
        e.preventDefault()
        handleSignUp()
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

      <TextField
        fullWidth
        name="displayName"
        label="Full Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 3 }}
        required
      />

      <TextField
        fullWidth
        name="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        InputLabelProps={{ shrink: true }}
        type={showPassword ? "text" : "password"}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                <Iconify icon={showPassword ? "solar:eye-bold" : "solar:eye-closed-bold"} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
        required
      />

      <TextField
        fullWidth
        name="confirmPassword"
        label="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        InputLabelProps={{ shrink: true }}
        type={showConfirmPassword ? "text" : "password"}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                <Iconify icon={showConfirmPassword ? "solar:eye-bold" : "solar:eye-closed-bold"} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
        required
      />

      <LoadingButton fullWidth size="large" type="submit" color="primary" variant="contained" loading={isLoading}>
        Sign Up
      </LoadingButton>
    </Box>
  )

  return (
    <Box>
      <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Sign Up</Typography>
        <Typography variant="body2" color="text.secondary">
          Already have an account?
          <Link href="/auth/sign-in" variant="subtitle2" sx={{ ml: 0.5 }}>
            Sign In
          </Link>
        </Typography>
      </Box>

      {renderForm}


      {/* Optionally, social signup buttons can be added here */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.isSuccess ? null : 6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          action={
            snackbar.isSuccess && (
              <>
                <Button color="inherit" size="small" onClick={handleCloseSnackbar}>
                  Close
                </Button>
                <Button color="inherit" size="small" onClick={handleGoToSignIn}>
                  Go to Sign In
                </Button>
              </>
            )
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

