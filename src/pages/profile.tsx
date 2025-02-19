import React, { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import {
  Box,
  CircularProgress,
  Container,
  Paper,
  Typography,
  Divider,
  Button,
  TextField,
  IconButton,
  Snackbar,
  InputAdornment,
} from "@mui/material"
import MuiAlert, { AlertProps } from "@mui/material/Alert"
import EditIcon from "@mui/icons-material/Edit"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"

import { CONFIG } from "src/config-global"
import {
  useGetProfileQuery,
  useUpdateDisplayNameMutation,
  useUpdatePasswordMutation,
} from "src/libs/service/profile/profile"
import type { ProfileProps } from "src/interfaces/profile-interfaces"
import { getRefreshToken } from 'src/utils/auth';

// Alert component using MuiAlert
const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
))

// Reusable PasswordField component for password inputs
interface PasswordFieldProps {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  showPassword: boolean
  togglePasswordVisibility: () => void
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  onChange,
  showPassword,
  togglePasswordVisibility,
}) => (
  <TextField
    type={showPassword ? "text" : "password"}
    label={label}
    value={value}
    onChange={onChange}
    variant="outlined"
    size="small"
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={togglePasswordVisibility} edge="end">
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    }}
  />
)

export default function Page() {
  const { data: profileData, isLoading } = useGetProfileQuery()
  const [profile, setProfile] = useState<ProfileProps | undefined>()
  const [updateDisplayName] = useUpdateDisplayNameMutation()
  const [updatePassword] = useUpdatePasswordMutation()

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success")

  // Editing state for display name and password
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [newDisplayName, setNewDisplayName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Visibility toggles for password fields
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [refreshTokenData, setRefreshTokenData] = useState("")

  useEffect(() => {
    if (!isLoading && profileData?.data[0]) {
      setProfile(profileData.data[0])
      setNewDisplayName(profileData.data[0].custom_display_name)
      const token_refresh = getRefreshToken()

      if (token_refresh){
        setRefreshTokenData(token_refresh)
      }
    }
  }, [isLoading, profileData])

  const handleConfirmDisplayName = async () => {
    if (newDisplayName !== profile?.custom_display_name) {
      const { error } = await updateDisplayName({ custom_display_name: newDisplayName })
      if (error) {
        setSnackbarMessage("Error updating display name")
        setSnackbarSeverity("error")
      } else {
        setProfile((prev) => (prev ? { ...prev, custom_display_name: newDisplayName } : prev))
        setSnackbarMessage("Display name updated successfully")
        setSnackbarSeverity("success")
      }
      setSnackbarOpen(true)
      setIsEditingDisplayName(false)
    }
  }

  const handleConfirmPassword = async () => {
    if (newPassword !== confirmPassword) {
      setSnackbarMessage("New Password does not match Confirm Password")
      setSnackbarSeverity("error")
    } else {
      const response = await updatePassword({ current_password: currentPassword, new_password: newPassword, refresh_token: refreshTokenData })
      const {data, error: pwdError} = response.data

      if (data) {
        setSnackbarMessage("Password updated successfully")
        setSnackbarSeverity("success")
      } else if (pwdError) {
        if((pwdError as any).code === 'same_password'){
          setSnackbarMessage("Same Password with current password")
        } else if ((pwdError as any).code === 'weak_password'){
          setSnackbarMessage("Password must be at least 6 characters")
        } else if ((pwdError as any).code === 'Current Password does not match'){
          setSnackbarMessage("Current Password does not match")
        } else {
          setSnackbarMessage("Cannot update new password")
        }
        setSnackbarSeverity("error")
      }
    }
    setSnackbarOpen(true)
    setIsEditingPassword(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleCancelDisplayName = () => {
    setIsEditingDisplayName(false)
    setNewDisplayName(profile?.custom_display_name || "")
  }

  const handleCancelPassword = () => {
    setIsEditingPassword(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleTogglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    switch (field) {
      case "current":
        setShowCurrentPassword((prev) => !prev)
        break
      case "new":
        setShowNewPassword((prev) => !prev)
        break
      case "confirm":
        setShowConfirmPassword((prev) => !prev)
        break
      default:
        break
    }
  }

  const handleCloseSnackbar = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return
    setSnackbarOpen(false)
  }

  if (isLoading || !profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Helmet>
        <title>{`Profile Settings - ${CONFIG.appName}`}</title>
      </Helmet>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Profile Settings
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Email
            </Typography>
            <Typography variant="body1">{profile.email}</Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Display Name
              <IconButton size="small" onClick={() => setIsEditingDisplayName((prev) => !prev)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Typography>
            {isEditingDisplayName ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  variant="outlined"
                  size="small"
                />
                <Button variant="contained" color="primary" onClick={handleConfirmDisplayName}>
                  Confirm
                </Button>
                <Button variant="outlined" color="secondary" onClick={handleCancelDisplayName}>
                  Cancel
                </Button>
              </Box>
            ) : (
              <Typography variant="body1">{profile.custom_display_name}</Typography>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Password
              <IconButton size="small" onClick={() => setIsEditingPassword((prev) => !prev)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Typography>
            {isEditingPassword && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <PasswordField
                    label="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    showPassword={showCurrentPassword}
                    togglePasswordVisibility={() => handleTogglePasswordVisibility("current")}
                  />
                  <PasswordField
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    showPassword={showNewPassword}
                    togglePasswordVisibility={() => handleTogglePasswordVisibility("new")}
                  />
                  <PasswordField
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    showPassword={showConfirmPassword}
                    togglePasswordVisibility={() => handleTogglePasswordVisibility("confirm")}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="contained" color="primary" onClick={handleConfirmPassword}>
                    Confirm
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={handleCancelPassword}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}
