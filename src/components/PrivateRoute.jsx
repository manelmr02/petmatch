import { Navigate } from "react-router-dom"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../firebase"
import { CircularProgress, Box, Typography } from "@mui/material"
import { useEffect, useState } from "react"

export default function PrivateRoute({ children }) {
  const [user, loading] = useAuthState(auth)
  const [showWarning, setShowWarning] = useState(false)
  const [redirect, setRedirect] = useState(false)

  useEffect(() => {
    const warningTimer = setTimeout(() => {
      if (!user && !redirect) setShowWarning(true)
    }, 5000)

    const redirectTimer = setTimeout(() => {
      if (!user && !loading) setRedirect(true)
    }, 10000)

    return () => {
      clearTimeout(warningTimer)
      clearTimeout(redirectTimer)
    }
  }, [loading, user])

  if (loading || (!user && !redirect)) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="50vh" gap={2}>
        <CircularProgress />
        {showWarning && (
          <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={300}>
            Esto está tardando más de lo normal. Puede que no tengas acceso porque no has iniciado sesión.
            Redirigiéndote al login...
          </Typography>
        )}
      </Box>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}
